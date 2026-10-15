import dotenv from "dotenv";

dotenv.config();

export const env = {
    DATABASE_URL: process.env.DATABASE_URL!,
    PORT: Number(process.env.PORT) || 5000,
    JWT_SECRET: process.env.JWT_SECRET!,
    CLIENT_URL: process.env.CLIENT_URL!,
    NODE_ENV: process.env.NODE_ENV || "development",

    CLOUDINARY_CLOUD_NAME:
        process.env.CLOUDINARY_CLOUD_NAME!,

    CLOUDINARY_API_KEY:
        process.env.CLOUDINARY_API_KEY!,

    CLOUDINARY_API_SECRET:
        process.env.CLOUDINARY_API_SECRET!,

    EMAIL_REMINDERS_ENABLED:
        process.env.EMAIL_REMINDERS_ENABLED === "true",

    EMAIL_REMINDER_SCHEDULER_ENABLED:
        process.env.EMAIL_REMINDER_SCHEDULER_ENABLED === "true",

    EMAIL_REMINDER_TIMEZONE:
        process.env.EMAIL_REMINDER_TIMEZONE || "Asia/Kolkata",

    EMAIL_REMINDER_TIMES:
        (process.env.EMAIL_REMINDER_TIMES || "12:00,16:00,20:00")
            .split(",")
            .map((time) => time.trim()),


    BREVO_API_KEY: process.env.BREVO_API_KEY || "",

    EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || "",

    EMAIL_FROM_NAME:
        process.env.EMAIL_FROM_NAME || "Team Work Tracker",
};