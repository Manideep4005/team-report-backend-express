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
};