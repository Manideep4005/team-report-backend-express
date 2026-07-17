import { Request, Response } from "express";
import reportService from "../services/report.service";
import { asyncHandler } from "../utils/asyncHandler";

export const save = asyncHandler(async (req: Request, res: Response) => {

    const report = await reportService.save(
        req.user.id,
        req.body.description
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

export const history = asyncHandler(async (req: Request, res: Response) => {

    const reports = await reportService.history(
        req.user.id,
        req.query.date as string | undefined
    );

    res.json({
        success: true,
        data: reports,
    });

});