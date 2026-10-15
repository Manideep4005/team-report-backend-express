
import { Prisma } from "@prisma/client";
import { fromZonedTime } from "date-fns-tz";

import { env } from "../config/env";
import emailReminderRepository from "../repositories/emailReminder.repository";
import { getISTTodayRange } from "../utils/date";
import brevoEmailService from "./brevoEmail.service";

type ReminderSlot = "12:00" | "16:00" | "20:00";

class EmailReminderService {
    private readonly timezone =
        env.EMAIL_REMINDER_TIMEZONE || "Asia/Kolkata";

    private getLocalParts(date = new Date()) {
        const parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: this.timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
        }).formatToParts(date);

        const value = (type: string) =>
            parts.find((part) => part.type === type)?.value ?? "";

        return {
            year: value("year"),
            month: value("month"),
            day: value("day"),
            weekday: value("weekday"),
            hour: value("hour"),
            minute: value("minute"),
        };
    }

    private getDateKey(date = new Date()) {
        const p = this.getLocalParts(date);
        return `${p.year}-${p.month}-${p.day}`;
    }

    private getDatabaseDate(dateKey: string) {
        // Prisma DateTime @db.Date: use UTC midnight for the
        // intended calendar date, not IST midnight converted to UTC.
        return new Date(`${dateKey}T00:00:00.000Z`);
    }

    private isWorkingDay(date = new Date()) {
        const p = this.getLocalParts(date);

        // Sunday
        if (p.weekday === "Sun") {
            return false;
        }

        // Skip second and fourth Saturdays.
        if (p.weekday === "Sat") {
            const day = Number(p.day);

            if (
                (day >= 8 && day <= 14) ||
                (day >= 22 && day <= 28)
            ) {
                return false;
            }
        }

        return true;
    }

    async getPendingUsers() {
        const { start, end } = getISTTodayRange();

        return emailReminderRepository.findPendingReportUsers(
            start,
            end,
        );
    }

    async getRecentJobs(limit = 20) {
        return emailReminderRepository.findRecentJobs(
            Math.min(Math.max(limit, 1), 100),
        );
    }

    async queueReminderSlot(
        slotTime: string,
        now = new Date(),
    ) {
        const isValidTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(slotTime);

        if (!isValidTime) {
            throw new Error(
                "Invalid reminder time. Expected HH:mm format, for example 14:35.",
            );
        }

        if (!this.isWorkingDay(now)) {
            return {
                skipped: true,
                reason: "Non-working day",
                slotTime,
            };
        }

        const dateKey = this.getDateKey(now);
        const jobDate = this.getDatabaseDate(dateKey);

        const existing =
            await emailReminderRepository.findJobByDateAndSlot(
                jobDate,
                slotTime,
            );

        if (existing) {
            return {
                alreadyQueued: true,
                job: existing,
            };
        }

        const { start, end } = getISTTodayRange();

        const pendingUsers =
            await emailReminderRepository.findPendingReportUsers(
                start,
                end,
            );

        const recipientUserIds = pendingUsers.map(
            (user) => user.id,
        );

        const scheduledFor = fromZonedTime(
            `${dateKey}T${slotTime}:00`,
            this.timezone,
        );

        try {
            const job = await emailReminderRepository.createJob({
                jobDate,
                slotTime,
                scheduledFor,
                recipientUserIds,
                status: recipientUserIds.length
                    ? "PENDING"
                    : "SKIPPED",
            });

            return {
                alreadyQueued: false,
                pendingCount: pendingUsers.length,
                recipients: pendingUsers,
                job,
            };
        } catch (error) {
            // Another server instance may have inserted this slot
            // between the lookup and create.
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                const duplicate =
                    await emailReminderRepository.findJobByDateAndSlot(
                        jobDate,
                        slotTime,
                    );

                if (duplicate) {
                    return {
                        alreadyQueued: true,
                        job: duplicate,
                    };
                }
            }

            throw error;
        }
    }

    async processCurrentSlot() {
        const parts = this.getLocalParts();
        const slotTime = `${parts.hour}:${parts.minute}`;

        if (!env.EMAIL_REMINDER_TIMES.includes(slotTime)) {
            console.log(
                `[Email Reminder] No configured slot at ${slotTime}`,
            );
            return;
        }

        const result = await this.queueReminderSlot(slotTime);

        const job =
            "job" in result ? result.job : undefined;

        if (job?.status === "PENDING") {
            const delivery = await this.deliverReminderJob(job.id);

            console.log("[Email Reminder] Delivery result:", delivery);

            return { ...result, delivery };
        }

        return result;
    }


    async deliverReminderJob(jobId: string) {
        if (!env.EMAIL_REMINDERS_ENABLED) {
            console.log(
                "[Email Reminder] Delivery disabled. Job remains queued:",
                jobId,
            );

            return {
                sent: 0,
                skipped: true,
                reason: "Email delivery disabled",
            };
        }

        const job = await emailReminderRepository.findJobById(jobId);

        if (!job) {
            throw new Error(`Email reminder job not found: ${jobId}`);
        }

        // Do not resend completed, skipped, processing, or failed jobs.
        if (job.status !== "PENDING") {
            return {
                sent: 0,
                skipped: true,
                reason: `Job status is ${job.status}`,
            };
        }

        const recipientIds: string[] = Array.isArray(job.recipientUserIds)
            ? job.recipientUserIds.filter(
                (id): id is string => typeof id === "string",
            )
            : [];

        if (recipientIds.length === 0) {
            await emailReminderRepository.markJobCompleted(job.id);

            return { sent: 0, skipped: true, reason: "No recipients" };
        }

        const claimed =
            await emailReminderRepository.markJobProcessing(job.id);

        if (claimed === 0) {
            return {
                sent: 0,
                skipped: true,
                reason: "Job is no longer pending or has already been claimed.",
            };
        }

        let sent = 0;
        const failures: string[] = [];

        try {
            const users =
                await emailReminderRepository.findUsersByIds(recipientIds);

            const usersById = new Map(
                users.map((user) => [user.id, user]),
            );

            for (const userId of recipientIds) {
                const user = usersById.get(userId);

                if (!user) {
                    failures.push(`User ${userId} not found or inactive`);
                    continue;
                }

                if (!user.email || !user.email.trim()) {
                    failures.push(`User ${userId} has no email address`);
                    continue;
                }

                try {
                    await brevoEmailService.sendReportReminder({
                        to: user.email,
                        recipientName: user.name,
                    });

                    sent++;
                } catch (error) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : "Unknown email delivery error";

                    failures.push(`${user.email}: ${message}`);
                }
            }

            if (failures.length > 0) {
                await emailReminderRepository.markJobFailed(
                    job.id,
                    `Accepted by Brevo: ${sent}/${recipientIds.length}. ` +
                    failures.join(" | "),
                );

                return {
                    sent,
                    failed: failures.length,
                    status: "FAILED",
                };
            }

            await emailReminderRepository.markJobCompleted(job.id);

            console.log(
                `[Email Reminder] Job ${job.id} completed. Emails accepted: ${sent}`,
            );

            return {
                sent,
                failed: 0,
                status: "COMPLETED",
            };
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Unknown error";

            await emailReminderRepository.markJobFailed(job.id, message);

            throw error;
        }
    }



    async cancelOrSkipReminderJob(
        jobId: string,
        action: "CANCEL" | "SKIP",
    ) {
        const job = await emailReminderRepository.findJobById(jobId);

        if (!job) {
            throw new Error(`Email reminder job not found: ${jobId}`);
        }

        if (job.status !== "PENDING") {
            return {
                updated: false,
                job,
                message: `Cannot ${action.toLowerCase()} job because its status is ${job.status}.`,
            };
        }

        const newStatus =
            action === "CANCEL" ? "CANCELLED" : "SKIPPED";

        const updatedCount =
            await emailReminderRepository.cancelOrSkipPendingJob(
                jobId,
                newStatus,
            );

        // Another request may have changed the job concurrently.
        const updatedJob =
            await emailReminderRepository.findJobById(jobId);

        if (!updatedJob) {
            throw new Error(`Email reminder job not found: ${jobId}`);
        }

        if (updatedCount === 0) {
            return {
                updated: false,
                job: updatedJob,
                message: `Job was not changed because its status is ${updatedJob.status}.`,
            };
        }

        return {
            updated: true,
            job: updatedJob,
            message:
                action === "CANCEL"
                    ? "Email reminder job cancelled successfully."
                    : "Email reminder job skipped successfully.",
        };
    }

}

export default new EmailReminderService();
