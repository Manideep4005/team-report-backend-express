import { z } from "zod";

export const reportExportQuerySchema = z
    .object({
        filter: z.enum(["all", "date", "month"]),

        date: z
            .string()
            .regex(
                /^\d{4}-\d{2}-\d{2}$/,
                "Date must be in YYYY-MM-DD format"
            )
            .optional(),

        month: z
            .string()
            .regex(
                /^\d{4}-\d{2}$/,
                "Month must be in YYYY-MM format"
            )
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (data.filter === "date" && !data.date) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["date"],
                message:
                    "date is required when filter is date",
            });
        }

        if (data.filter === "month" && !data.month) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["month"],
                message:
                    "month is required when filter is month",
            });
        }

        if (data.filter === "all") {
            if (data.date || data.month) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["filter"],
                    message:
                        "date/month should not be provided when filter is all",
                });
            }
        }

        if (data.filter === "date" && data.month) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["month"],
                message:
                    "month should not be provided when filter is date",
            });
        }

        if (data.filter === "month" && data.date) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["date"],
                message:
                    "date should not be provided when filter is month",
            });
        }
    });

export type ReportExportQuery = z.infer<
    typeof reportExportQuerySchema
>;