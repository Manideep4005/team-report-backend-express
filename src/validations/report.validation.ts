import { z } from "zod";

export const saveReportSchema = z.object({
    description: z
        .string()
        .trim()
        .min(10, "Minimum 10 characters required.")
        .max(5000),
});