import { z } from "zod";

export const reportExportQuerySchema = z
    .object({
        filter: z.enum([
            "all",
            "date",
            "month",
            "range",
        ]),

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

        from: z
            .string()
            .regex(
                /^\d{4}-\d{2}-\d{2}$/,
                "From date must be in YYYY-MM-DD format"
            )
            .optional(),

        to: z
            .string()
            .regex(
                /^\d{4}-\d{2}-\d{2}$/,
                "To date must be in YYYY-MM-DD format"
            )
            .optional(),
    })
    .superRefine((data, ctx) => {

        // DATE
        if (data.filter === "date" && !data.date) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["date"],
                message:
                    "date is required when filter is date",
            });
        }

        // MONTH
        if (data.filter === "month" && !data.month) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["month"],
                message:
                    "month is required when filter is month",
            });
        }

        // RANGE
        if (data.filter === "range") {
            if (!data.from) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["from"],
                    message:
                        "from is required when filter is range",
                });
            }

            if (!data.to) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["to"],
                    message:
                        "to is required when filter is range",
                });
            }

            if (data.from && data.to) {
                const fromDate =
                    new Date(`${data.from}T00:00:00`);

                const toDate =
                    new Date(`${data.to}T00:00:00`);

                if (fromDate > toDate) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["to"],
                        message:
                            "to must be greater than or equal to from",
                    });
                }
            }
        }

        // ALL
        if (data.filter === "all") {
            if (
                data.date ||
                data.month ||
                data.from ||
                data.to
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["filter"],
                    message:
                        "date/month/from/to should not be provided when filter is all",
                });
            }
        }

        // DATE
        if (data.filter === "date") {
            if (data.month || data.from || data.to) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["filter"],
                    message:
                        "month/from/to should not be provided when filter is date",
                });
            }
        }

        // MONTH
        if (data.filter === "month") {
            if (data.date || data.from || data.to) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["filter"],
                    message:
                        "date/from/to should not be provided when filter is month",
                });
            }
        }

        // RANGE
        if (data.filter === "range") {
            if (data.date || data.month) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["filter"],
                    message:
                        "date/month should not be provided when filter is range",
                });
            }
        }
    });

export type ReportExportQuery =
    z.infer<typeof reportExportQuerySchema>;