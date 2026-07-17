import { Request, Response } from "express";
import teamService from "../services/team.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getTodayReports = asyncHandler(
    async (_req: Request, res: Response) => {

        const reports =
            await teamService.getTodayReports();

        res.json({
            success: true,
            data: reports,
        });

    }
);