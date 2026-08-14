import { z } from "zod";

export const createRoleSchema = z.object({
    name: z
        .string()
        .min(2, "Role name must be at least 2 characters")
        .max(50, "Role name is too long"),

    description: z
        .string()
        .max(255, "Description is too long")
        .optional(),

    permissionIds: z
        .array(
            z.string().uuid("Invalid permission ID")
        )
        .default([]),
});

export const updateRoleSchema = z.object({
    name: z
        .string()
        .min(2, "Role name must be at least 2 characters")
        .max(50, "Role name is too long")
        .optional(),

    description: z
        .string()
        .max(255, "Description is too long")
        .optional(),

    permissionIds: z
        .array(
            z.string().uuid("Invalid permission ID")
        )
        .default([]),
});