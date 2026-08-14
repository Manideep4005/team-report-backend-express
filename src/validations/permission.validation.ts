import { z } from "zod";

export const createPermissionSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, "Permission code is required")
        .regex(
            /^[A-Z0-9_]+$/,
            "Permission code must contain only uppercase letters, numbers and underscores"
        ),

    name: z
        .string()
        .trim()
        .min(1, "Permission name is required"),

    description: z
        .string()
        .trim()
        .optional(),
});

export const updatePermissionSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, "Permission code is required")
        .regex(
            /^[A-Z0-9_]+$/,
            "Permission code must contain only uppercase letters, numbers and underscores"
        )
        .optional(),

    name: z
        .string()
        .trim()
        .min(1, "Permission name is required")
        .optional(),

    description: z
        .string()
        .trim()
        .optional(),
});