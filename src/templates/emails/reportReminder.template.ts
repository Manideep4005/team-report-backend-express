
export interface ReportReminderTemplateInput {
    recipientName: string;
    websiteUrl: string;
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };

        return entities[character];
    });
}

export function reportReminderTemplate({
    recipientName,
    websiteUrl,
}: ReportReminderTemplateInput) {
    // Escape HTML content and attribute values.
    const safeName = escapeHtml(recipientName);
    const safeWebsiteUrl = escapeHtml(websiteUrl);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Daily Work Report Reminder</title>
</head>
<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f6f8;
    font-family: Arial, Helvetica, sans-serif;
    color: #263238;
">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
        style="background-color: #f4f6f8; padding: 32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0"
                    cellpadding="0" style="
                        width: 100%;
                        max-width: 600px;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                    ">
                    <tr>
                        <td style="
                            background-color: #1d4ed8;
                            padding: 28px 32px;
                            color: #ffffff;
                        ">
                            <h1 style="margin: 0; font-size: 24px;">
                                Team Work Tracker
                            </h1>
                            <p style="margin: 8px 0 0; font-size: 14px;">
                                Daily work report reminder
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 32px;">
                            <h2 style="
                                margin: 0 0 18px;
                                font-size: 22px;
                                color: #111827;
                            ">
                                Hi ${safeName},
                            </h2>

                            <p style="
                                font-size: 15px;
                                line-height: 1.7;
                                margin: 0 0 16px;
                            ">
                                This is a friendly reminder to submit
                                your daily work report for today.
                            </p>

                            <p style="
                                font-size: 15px;
                                line-height: 1.7;
                                margin: 0 0 24px;
                            ">
                                Please visit the Team Work Tracker website
                                and submit your report if you haven't
                                already done so.
                            </p>

                            <table role="presentation" cellspacing="0"
                                cellpadding="0" style="margin: 0 0 24px;">
                                <tr>
                                    <td align="center"
                                        bgcolor="#1d4ed8"
                                        style="border-radius: 6px;">
                                        <a href="${safeWebsiteUrl}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style="
                                                display: inline-block;
                                                padding: 14px 26px;
                                                color: #ffffff;
                                                text-decoration: none;
                                                font-size: 15px;
                                                font-weight: bold;
                                                border-radius: 6px;
                                            ">
                                            Visit Website
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="
                                color: #64748b;
                                font-size: 13px;
                                line-height: 1.6;
                                margin: 0;
                            ">
                                If you have already submitted today's
                                report, please ignore this reminder.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            background-color: #f8fafc;
                            padding: 20px 32px;
                            border-top: 1px solid #e5e7eb;
                        ">
                            <p style="
                                margin: 0;
                                font-size: 13px;
                                line-height: 1.6;
                                color: #64748b;
                            ">
                                Regards,<br />
                                <strong>Team Work Tracker</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const text = [
        `Hi ${recipientName},`,
        "",
        "This is a friendly reminder to submit your daily work report for today.",
        "Visit the Team Work Tracker website:",
        websiteUrl,
        "",
        "If you have already submitted today's report, please ignore this reminder.",
        "",
        "Regards,",
        "Team Work Tracker",
    ].join("\n");

    return { html, text };
}
