import { Request, Response } from "express";
import summaryService from "../services/summary.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getSummary = asyncHandler(
    async (req: Request, res: Response) => {

        const summary =
            await summaryService.getSummary();

        res.json({
            success: true,
            data: summary,
        });

    }


);


export const getSummaryByDate = asyncHandler(
    async (req: Request, res: Response) => {
        const { date } = req.query;

        if (!date || typeof date !== "string") {
            return res.status(400).json({
                success: false,
                message: "Date is required. Format: YYYY-MM-DD",
            });
        }

        const summary = await summaryService.getSummaryByDate(
            new Date(date)
        );

        res.json({
            success: true,
            data: summary,
        });
    }
);