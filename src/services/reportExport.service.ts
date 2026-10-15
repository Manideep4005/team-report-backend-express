
import ExcelJS from "exceljs";

import reportRepository from "../repositories/report.repository";

import { buildReportExportWhere } from "../utils/reportExport";

import type { ReportExportQuery } from "../validations/report-export.validation";

class ReportExportService {
    private formatDate(date: Date): string {
        return new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date);
    }

    private formatDateTime(date: Date): string {
        return new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    }

    private getPeriodLabel(options: ReportExportQuery): string {
        if (options.filter === "all") {
            return "All Reports";
        }

        if (options.filter === "date" && options.date) {
            return options.date;
        }

        if (options.filter === "month" && options.month) {
            const [year, month] = options.month.split("-");

            const date = new Date(
                Number(year),
                Number(month) - 1,
                1
            );

            return new Intl.DateTimeFormat("en-IN", {
                month: "long",
                year: "numeric",
            }).format(date);
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
     * - Maximum 31 characters.
     * - Cannot contain: \ / ? * [ ] :
     */
    private sanitizeSheetName(name: string): string {
        const sheetName = name
            .replace(/[\\/?*[\]:]/g, "")
            .trim();

        return (sheetName || "User").substring(0, 31);
    }

    /**
     * Ensure worksheet names are unique.
     */
    private getUniqueSheetName(
        name: string,
        usedNames: Set<string>
    ): string {
        const baseName = this.sanitizeSheetName(name);

        let sheetName = baseName;
        let counter = 2;

        while (usedNames.has(sheetName.toLowerCase())) {
            const suffix = ` (${counter})`;
            const maxBaseLength = 31 - suffix.length;

            sheetName =
                `${baseName.substring(0, maxBaseLength)}${suffix}`;

            counter++;
        }

        usedNames.add(sheetName.toLowerCase());

        return sheetName;
    }

    /**
     * Configure worksheet columns and formatting.
     * Header row has no background color.
     */
    private styleWorksheet(worksheet: ExcelJS.Worksheet): void {
        worksheet.columns = [
            {
                header: "Date",
                key: "date",
                width: 18,
            },
            {
                header: "Report",
                key: "report",
                width: 100,
            },
        ];

        // Keep the header visible while scrolling.
        worksheet.views = [
            {
                state: "frozen",
                ySplit: 1,
            },
        ];

        // Enable filtering on both columns.
        worksheet.autoFilter = {
            from: "A1",
            to: "B1",
        };

        const headerRow = worksheet.getRow(1);

        headerRow.height = 24;

        // Bold text without a background fill or font color.
        headerRow.font = {
            bold: true,
            size: 11,
        };

        headerRow.alignment = {
            vertical: "middle",
            horizontal: "center",
        };

        // Subtle bottom border only; no background color.
        headerRow.eachCell((cell) => {
            cell.border = {
                bottom: {
                    style: "thin",
                },
            };
        });

        worksheet.getColumn(1).alignment = {
            vertical: "top",
        };

        worksheet.getColumn(2).alignment = {
            vertical: "top",
            wrapText: true,
        };
    }

    /**
     * Add report data below the header row.
     */
    private addReportRows(
        worksheet: ExcelJS.Worksheet,
        reports: any[]
    ): void {
        for (const report of reports) {
            const row = worksheet.addRow({
                date: this.formatDate(report.reportDate),
                report: report.description,
            });

            row.alignment = {
                vertical: "top",
                wrapText: true,
            };

            row.getCell(1).alignment = {
                vertical: "top",
                horizontal: "center",
            };

            row.getCell(2).alignment = {
                vertical: "top",
                wrapText: true,
            };
        }
    }

    /**
     * Create a worksheet with Date and Report headers.
     */
    private createUserWorksheet(
        workbook: ExcelJS.Workbook,
        sheetName: string,
        reports: any[]
    ): ExcelJS.Worksheet {
        const worksheet = workbook.addWorksheet(sheetName);

        this.styleWorksheet(worksheet);
        this.addReportRows(worksheet, reports);

        return worksheet;
    }

    /**
     * Export reports belonging to the authenticated user.
     * Workbook contains one worksheet.
     */
    async exportOwn(
        userId: string,
        options: ReportExportQuery
    ): Promise<ExcelJS.Workbook> {
        const where = buildReportExportWhere(options);

        const reports = await reportRepository.exportOwn(
            userId,
            where
        );

        const workbook = new ExcelJS.Workbook();

        workbook.creator = "Team Report Tracker";
        workbook.created = new Date();
        workbook.modified = new Date();

        this.createUserWorksheet(
            workbook,
            "My Reports",
            reports
        );

        return workbook;
    }

    /**
     * Export all reports.
     * Each user receives their own worksheet.
     */
    async exportAll(
        options: ReportExportQuery
    ): Promise<ExcelJS.Workbook> {
        const where = buildReportExportWhere(options);

        const reports = await reportRepository.exportAll(where);

        const workbook = new ExcelJS.Workbook();

        workbook.creator = "Team Report Tracker";
        workbook.created = new Date();
        workbook.modified = new Date();

        const usedSheetNames = new Set<string>();

        // Group reports by user.
        const reportsByUser = new Map<
            string,
            {
                user: any;
                reports: any[];
            }
        >();

        for (const report of reports) {
            const userId = report.user.id;

            if (!reportsByUser.has(userId)) {
                reportsByUser.set(userId, {
                    user: report.user,
                    reports: [],
                });
            }

            reportsByUser.get(userId)!.reports.push(report);
        }

        // Create one worksheet per user.
        for (const userData of reportsByUser.values()) {
            const sheetName = this.getUniqueSheetName(
                userData.user.name,
                usedSheetNames
            );

            this.createUserWorksheet(
                workbook,
                sheetName,
                userData.reports
            );
        }

        // Ensure the workbook has at least one worksheet.
        if (workbook.worksheets.length === 0) {
            this.createUserWorksheet(
                workbook,
                "Reports",
                []
            );
        }

        return workbook;
    }
}

export default new ReportExportService();
