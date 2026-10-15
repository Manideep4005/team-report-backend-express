
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

class EmailReminderRepository {
    async findPendingReportUsers(start: Date, end: Date) {
        return prisma.user.findMany({
            where: {
                deletedAt: null,
                reports: {
                    none: {
                        reportDate: {
                            gte: start,
                            lt: end,
                        },
                    },
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: { name: "asc" },
        });
    }

    async findJobByDateAndSlot(jobDate: Date, slotTime: string) {
        return prisma.emailReminderJob.findUnique({
            where: {
                jobDate_slotTime: { jobDate, slotTime },
            },
        });
    }

    async createJob(input: {
        jobDate: Date;
        slotTime: string;
        scheduledFor: Date;
        recipientUserIds: string[];
        status: "PENDING" | "SKIPPED";
    }) {
        return prisma.emailReminderJob.create({
            data: {
                ...input,
                recipientUserIds:
                    input.recipientUserIds as Prisma.InputJsonValue,
                recipientCount: input.recipientUserIds.length,
                processedAt:
                    input.status === "SKIPPED" ? new Date() : null,
            },
        });
    }

    async findRecentJobs(limit = 20) {
        return prisma.emailReminderJob.findMany({
            orderBy: [
                { jobDate: "desc" },
                { slotTime: "desc" },
            ],
            take: limit,
        });
    }


    async findJobById(id: string) {
        return prisma.emailReminderJob.findUnique({
            where: { id },
        });
    }

    async findUsersByIds(ids: string[]) {
        return prisma.user.findMany({
            where: {
                id: { in: ids },
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
    }


    async markJobProcessing(id: string): Promise<number> {
        const result = await prisma.emailReminderJob.updateMany({
            where: {
                id,
                status: "PENDING",
            },
            data: {
                status: "PROCESSING",
                attempts: { increment: 1 },
                lastError: null,
            },
        });

        return result.count;
    }


    async markJobCompleted(id: string) {
        return prisma.emailReminderJob.update({
            where: { id },
            data: {
                status: "COMPLETED",
                processedAt: new Date(),
                lastError: null,
            },
        });
    }

    async markJobFailed(id: string, errorMessage: string) {
        return prisma.emailReminderJob.update({
            where: { id },
            data: {
                status: "FAILED",
                processedAt: new Date(),
                lastError: errorMessage.slice(0, 5000),
            },
        });
    }



    async cancelOrSkipPendingJob(
        id: string,
        status: "CANCELLED" | "SKIPPED",
    ) {
        const result = await prisma.emailReminderJob.updateMany({
            where: {
                id,
                status: "PENDING",
            },
            data: {
                status,
                processedAt: new Date(),
                lastError: null,
            },
        });

        return result.count;
    }

}

export default new EmailReminderRepository();
