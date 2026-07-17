import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(50),

    email: z
        .email("Invalid email address")
        .transform((email) => email.toLowerCase()),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(50),
});

export const loginSchema = z.object({
    email: z
        .email("Invalid email address")
        .transform((email) => email.toLowerCase()),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});