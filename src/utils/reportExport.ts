import {
    getISTRange,
} from "./date";

export type ReportExportFilter = {
    filter: "all" | "date" | "month";
    date?: string;
    month?: string;
};

/**
 * Builds the Prisma where condition for report exports.
 *
 * all:
 *     {}
 *
 * date:
 *     reportDate >= start of date
 *     reportDate <  start of next date
 *
 * month:
 *     reportDate >= start of month
 *     reportDate <  start of next month
 */
export function buildReportExportWhere(
    options: ReportExportFilter
) {
    if (options.filter === "all") {
        return {};
    }

    if (
        options.filter === "date" &&
        options.date
    ) {
        const { start, end } =
            getISTRange(options.date);

        return {
            reportDate: {
                gte: start,
                lt: end,
            },
        };
    }

    if (
        options.filter === "month" &&
        options.month
    ) {
        const [yearString, monthString] =
            options.month.split("-");

        const year = Number(yearString);
        const month = Number(monthString);

        if (
            !Number.isInteger(year) ||
            !Number.isInteger(month) ||
            month < 1 ||
            month > 12
        ) {
            throw new Error(
                "Invalid month. Expected YYYY-MM."
            );
        }

        const monthStart =
            `${year}-${String(month).padStart(2, "0")}-01`;

        let nextYear = year;
        let nextMonth = month + 1;

        if (nextMonth === 13) {
            nextMonth = 1;
            nextYear++;
        }

        const nextMonthStart =
            `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

        const { start } =
            getISTRange(monthStart);

        const { start: end } =
            getISTRange(nextMonthStart);

        return {
            reportDate: {
                gte: start,
                lt: end,
            },
        };
    }

    throw new Error(
        "Invalid report export filter."
    );
}