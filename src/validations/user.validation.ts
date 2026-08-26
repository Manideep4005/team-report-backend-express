import { z } from "zod";

export const createUserSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters"),

    email: z
        .string()
        .email("Invalid email"),


    roleId: z
        .string()
        .uuid("Invalid role ID"),
});

export const updateUserSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .optional(),

    email: z
        .string()
        .email("Invalid email")
        .optional(),

    roleId: z
        .string()
        .uuid("Invalid role ID")
        .optional(),
});