
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

export const createUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),

    username: usernameSchema.optional(),

    email: z
        .string()
        .trim()
        .email("Invalid email")
        .transform((email) => email),

    roleId: z
        .string()
        .uuid("Invalid role ID"),
});

export const updateUserSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name cannot exceed 50 characters")
            .optional(),

        username: usernameSchema.optional(),

        email: z
            .string()
            .trim()
            .email("Invalid email")
            .transform((email) => email)
            .optional(),

        roleId: z
            .string()
            .uuid("Invalid role ID")
            .optional(),
    })
    .refine(
        (data) =>
            Object.values(data).some((value) => value !== undefined),
        {
            message: "At least one field must be provided",
        },
    );
