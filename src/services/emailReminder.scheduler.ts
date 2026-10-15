
import cron from "node-cron";

import { env } from "../config/env";
import emailReminderService from "./emailReminder.service";

let schedulerStarted = false;

export function startEmailReminderScheduler() {
    if (!env.EMAIL_REMINDER_SCHEDULER_ENABLED) {
        console.log("[Email Reminder] Scheduler disabled.");
        return;
    }

    if (schedulerStarted) {
        return;
    }

    schedulerStarted = true;

    cron.schedule(
        "0 12,16,20 * * *",
        async () => {
            try {
                await emailReminderService.processCurrentSlot();
            } catch (error) {
                console.error(
                    "[Email Reminder] Scheduler failed:",
                    error,
                );
            }
        },
        {
            timezone: env.EMAIL_REMINDER_TIMEZONE,
        },
    );

    console.log(
        `[Email Reminder] Scheduler started (${env.EMAIL_REMINDER_TIMEZONE}).`,
    );
}
