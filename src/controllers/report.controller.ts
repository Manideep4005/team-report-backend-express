import { Request, Response } from "express";
import reportService from "../services/report.service";
import { asyncHandler } from "../utils/asyncHandler";
import reportExportService from "../services/reportExport.service";
import { reportExportQuerySchema } from "../validations/report-export.validation";

export const save = asyncHandler(async (req: Request, res: Response) => {

    const report =
        await reportService.save(
            req.user.id,
            req.body.description,
            req.body.reportDate
        );

    res.json({
        success: true,
        data: report,
    });

});

export const today = asyncHandler(async (req: Request, res: Response) => {

    const report = await reportService.today(
        req.user.id
    );

    res.json({
        success: true,
        data: report,
    });

});

export const history = asyncHandler(
    async (req: Request, res: Response) => {
        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 10,
                1
            ),
            50
        );

        const reports =
            await reportService.history(
                req.user.id,
                req.query.date as string | undefined,
                page,
                limit
            );

        res.json({
            success: true,
            data: reports,
        });
    }
);

export const all = asyncHandler(
    async (req: Request, res: Response) => {

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 10,
                1
            ),
            50
        );

        const reports =
            await reportService.all(
                req.query.date as string | undefined,
                page,
                limit
            );

        res.json({
            success: true,
            data: reports,
        });
    }
);

export const reportUsers = asyncHandler(
    async (req: Request, res: Response) => {

        const users =
            await reportService.reportUsers();

        res.json({
            success: true,
            data: users,
        });
    }
);

export const userReports = asyncHandler(
    async (req: Request, res: Response) => {

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 10,
                1
            ),
            50
        );

        const reports =
            await reportService.userReports(
                req.params.userId as any,
                req.query.date as string | undefined,
                page,
                limit
            );

        res.json({
            success: true,
            data: reports,
        });
    }
);

export const exportOwn = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {
        const parsed =
            reportExportQuerySchema.safeParse(
                req.query
            );

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid export parameters",
                errors:
                    parsed.error.flatten(),
            });
        }

        const workbook =
            await reportExportService.exportOwn(
                req.user.id,
                parsed.data
            );

        const buffer =
            await workbook.xlsx.writeBuffer();

        const period =
            parsed.data.filter === "month"
                ? parsed.data.month
                : parsed.data.filter === "date"
                    ? parsed.data.date
                    : parsed.data.filter === "range"
                        ? `${parsed.data.from}_to_${parsed.data.to}`
                        : "all";

        const filename =
            `reports_${period}.xlsx`;

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );

        res.send(buffer);
    }
);

export const exportAll = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {
        const parsed =
            reportExportQuerySchema.safeParse(
                req.query
            );

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid export parameters",
                errors:
                    parsed.error.flatten(),
            });
        }

        const workbook =
            await reportExportService.exportAll(
                parsed.data
            );

        const buffer =
            await workbook.xlsx.writeBuffer();

        const period =
            parsed.data.filter === "month"
                ? parsed.data.month
                : parsed.data.filter === "date"
                    ? parsed.data.date
                    : parsed.data.filter === "range"
                        ? `${parsed.data.from}_to_${parsed.data.to}`
                        : "all";



        const filename =
            `all_reports_${period}.xlsx`;

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );

        res.send(buffer);
    }
);