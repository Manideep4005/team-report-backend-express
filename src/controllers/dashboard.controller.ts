import { Request, Response } from "express";
import dashboardService from "../services/dashboard.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getDashboard = asyncHandler(
    async (req: Request, res: Response) => {

        const dashboard =
            await dashboardService.getDashboard(
                req.user.id
            );

        res.json({
            success: true,
            data: dashboard,
        });

    }
);