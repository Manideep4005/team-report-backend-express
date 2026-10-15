
import { env } from "../config/env";
import { reportReminderTemplate } from "../templates/emails/reportReminder.template";

interface ReminderEmailInput {
    to: string;
    recipientName: string;
}

class BrevoEmailService {
    async sendReportReminder({
        to,
        recipientName,
    }: ReminderEmailInput): Promise<void> {
        if (!env.EMAIL_REMINDERS_ENABLED) {
            throw new Error("Email reminders are disabled.");
        }

        if (!env.BREVO_API_KEY) {
            throw new Error("BREVO_API_KEY is not configured.");
        }

        if (!env.EMAIL_FROM_ADDRESS) {
            throw new Error("EMAIL_FROM_ADDRESS is not configured.");
        }

        if (!env.CLIENT_URL) {
            throw new Error("CLIENT_URL is not configured.");
        }

        const websiteUrl = env.CLIENT_URL.replace(/\/+$/, "");

        const { html, text } = reportReminderTemplate({
            recipientName,
            websiteUrl,
        });

        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "api-key": env.BREVO_API_KEY,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    sender: {
                        name: env.EMAIL_FROM_NAME,
                        email: env.EMAIL_FROM_ADDRESS,
                    },
                    to: [
                        {
                            email: to,
                            name: recipientName,
                        },
                    ],
                    subject: "Reminder: Submit Your Daily Work Report",
                    htmlContent: html,
                    textContent: text,
                }),
            },
        );

        if (!response.ok) {
            const errorBody = await response.text();

            throw new Error(
                `Brevo delivery failed (${response.status}): ` +
                errorBody.slice(0, 500),
            );
        }
    }
}

export default new BrevoEmailService();
