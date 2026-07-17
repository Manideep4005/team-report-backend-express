import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(100),
});

export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(6),

    newPassword: z
        .string()
        .min(6)
        .max(100),
});