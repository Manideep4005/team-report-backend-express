import ExcelJS from "exceljs";

import reportRepository from "../repositories/report.repository";

import {
    buildReportExportWhere,
} from "../utils/reportExport";

import type {
    ReportExportQuery,
} from "../validations/report-export.validation";

class ReportExportService {

    private formatDate(
        date: Date
    ) {
        return new Intl.DateTimeFormat(
            "en-IN",
            {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        ).format(date);
    }

    private formatDateTime(
        date: Date
    ) {
        return new Intl.DateTimeFormat(
            "en-IN",
            {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }
        ).format(date);
    }

    private getPeriodLabel(
        options: ReportExportQuery
    ) {
        if (options.filter === "all") {
            return "All Reports";
        }

        if (
            options.filter === "date" &&
            options.date
        ) {
            return options.date;
        }

        if (
            options.filter === "month" &&
            options.month
        ) {
            const [
                year,
                month,
            ] = options.month.split("-");

            const date = new Date(
                Number(year),
                Number(month) - 1,
                1
            );

            return new Intl.DateTimeFormat(
                "en-IN",
                {
                    month: "long",
                    year: "numeric",
                }
            ).format(date);
        }

        if (
            options.filter === "range" &&
            options.from &&
            options.to
        ) {
            return `${options.from} to ${options.to}`;
        }

        return "Reports";
    }

    /**
     * Excel worksheet names:
     *
     * - max 31 characters
     * - cannot contain \ / ? * [ ] :
     */
    private sanitizeSheetName(
        name: string
    ) {
        let sheetName = name
            .replace(/[\\\/\?\*\[\]\:]/g, "")
            .trim();

        if (!sheetName) {
            sheetName = "User";
        }

        return sheetName.substring(0, 31);
    }

    /**
     * Ensures duplicate user names do not
     * create duplicate worksheet names.
     */
    private getUniqueSheetName(
        name: string,
        usedNames: Set<string>
    ) {
        const baseName =
            this.sanitizeSheetName(name);

        let sheetName = baseName;
        let counter = 2;

        while (
            usedNames.has(
                sheetName.toLowerCase()
            )
        ) {
            const suffix =
                ` (${counter})`;

            const maxBaseLength =
                31 - suffix.length;

            sheetName =
                `${baseName.substring(
                    0,
                    maxBaseLength
                )}${suffix}`;

            counter++;
        }

        usedNames.add(
            sheetName.toLowerCase()
        );

        return sheetName;
    }

    private styleWorksheet(
        worksheet: ExcelJS.Worksheet
    ) {
        worksheet.getColumn(1).width = 15;
        worksheet.getColumn(2).width = 100;

        worksheet.getColumn(1).alignment = {
            vertical: "top",
        };

        worksheet.getColumn(2).alignment = {
            vertical: "top",
            wrapText: true,
        };
    }

    private addReportRows(
        worksheet: ExcelJS.Worksheet,
        reports: any[]
    ) {
        for (const report of reports) {
            const row = worksheet.addRow([
                this.formatDate(report.reportDate),
                report.description,
            ]);

            row.alignment = {
                vertical: "top",
                wrapText: true,
            };
        }
    }

    private createUserWorksheet(
        workbook: ExcelJS.Workbook,
        sheetName: string,
        userName: string,
        reports: any[]
    ) {
        const worksheet =
            workbook.addWorksheet(sheetName);

        this.styleWorksheet(worksheet);

        this.addReportRows(
            worksheet,
            reports
        );

        return worksheet;
    }

    /**
     * Export reports belonging to the
     * authenticated user.
     *
     * Workbook contains ONE worksheet.
     */
    async exportOwn(
        userId: string,
        options: ReportExportQuery
    ) {
        const where =
            buildReportExportWhere(
                options
            );

        const reports =
            await reportRepository.exportOwn(
                userId,
                where
            );

        const workbook =
            new ExcelJS.Workbook();

        workbook.creator =
            "Team Report Tracker";

        workbook.created =
            new Date();

        workbook.modified =
            new Date();

        const sheetName =
            "My Reports";

        this.createUserWorksheet(
            workbook,
            sheetName,
            "My Reports",
            reports
        );

        return workbook;
    }

    /**
     * Export all reports.
     *
     * IMPORTANT:
     *
     * Each user receives their own
     * worksheet.
     */
    async exportAll(
        options: ReportExportQuery
    ) {
        const where =
            buildReportExportWhere(
                options
            );

        const reports =
            await reportRepository.exportAll(
                where
            );

        const workbook =
            new ExcelJS.Workbook();

        workbook.creator =
            "Team Report Tracker";

        workbook.created =
            new Date();

        workbook.modified =
            new Date();

        const periodLabel =
            this.getPeriodLabel(
                options
            );

        const usedSheetNames =
            new Set<string>();

        /**
         * Group reports by user.
         */
        const reportsByUser =
            new Map<
                string,
                {
                    user: any;
                    reports: any[];
                }
            >();

        for (const report of reports) {
            const userId =
                report.user.id;

            if (
                !reportsByUser.has(
                    userId
                )
            ) {
                reportsByUser.set(
                    userId,
                    {
                        user: report.user,
                        reports: [],
                    }
                );
            }

            reportsByUser
                .get(userId)!
                .reports.push(report);
        }

        /**
         * Create one worksheet per user.
         */
        for (
            const [
                ,
                userData,
            ] of reportsByUser
        ) {
            const sheetName =
                this.getUniqueSheetName(
                    userData.user.name,
                    usedSheetNames
                );

            this.createUserWorksheet(
                workbook,
                sheetName,
                userData.user.name,
                userData.reports
            );
        }

        /**
         * If there are no reports, Excel
         * requires at least one worksheet.
         */
        if (
            workbook.worksheets.length === 0
        ) {
            this.createUserWorksheet(
                workbook,
                "Reports",
                "No Reports",
                []
            );
        }

        return workbook;
    }
}

export default new ReportExportService();