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