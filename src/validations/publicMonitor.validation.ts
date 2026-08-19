import { z } from "zod";

export const createMonitorLinkSchema = z
    .object({
        expirationType: z.enum([
            "MINUTES",
            "HOURS",
            "NEVER",
        ]),

        expirationValue: z
            .number()
            .int()
            .positive()
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (
            data.expirationType !== "NEVER" &&
            data.expirationValue === undefined
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["expirationValue"],
                message:
                    "Expiration value is required.",
            });
        }

        if (
            data.expirationType === "NEVER" &&
            data.expirationValue !== undefined
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["expirationValue"],
                message:
                    "Expiration value is not required for never-expiring links.",
            });
        }
    });

export type CreateMonitorLinkInput = z.infer<
    typeof createMonitorLinkSchema
>;