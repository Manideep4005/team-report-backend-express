import { Request, Response } from "express";
import reportService from "../services/report.service";
import { asyncHandler } from "../utils/asyncHandler";

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