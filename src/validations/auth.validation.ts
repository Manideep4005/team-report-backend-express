
import { z } from "zod";

const usernameSchema = z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
        /^[a-zA-Z0-9._-]+$/,
        "Username can contain only letters, numbers, dots, underscores, and hyphens",
    )
    .transform((username) => username);

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name cannot exceed 50 characters"),

    username: usernameSchema.optional(),

    email: z
        .email("Invalid email address")
        .transform((email) => email),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(50, "Password cannot exceed 50 characters"),
});

export const loginSchema = z
    .object({
        identifier: z
            .string()
            .trim()
            .min(1, "Username or email is required")
            .max(254, "Username or email is too long")
            .optional(),

        // Backward compatibility with existing clients sending `email`.
        email: z
            .string()
            .trim()
            .min(1, "Username or email is required")
            .max(254, "Username or email is too long")
            .optional(),

        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(50, "Password cannot exceed 50 characters"),
    })
    .refine(
        (data) =>
            Boolean(data.identifier?.trim() || data.email?.trim()),
        {
            message: "Username or email is required",
            path: ["identifier"],
        },
    );
