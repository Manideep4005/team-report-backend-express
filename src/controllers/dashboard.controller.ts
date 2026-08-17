import { Request, Response } from "express";
import dashboardService from "../services/dashboard.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getDashboard = asyncHandler(
    async (req: Request, res: Response) => {
        const dashboard = await dashboardService.getDashboard(
            req.user.id,
            req.query.date as string | undefined
        );

        res.json({
            success: true,
            data: dashboard,
        });
    }
);

export const loginPreview = asyncHandler(
    async (req: Request, res: Response) => {

        const preview =
            await dashboardService.getLoginPreview();

        res.json({
            success: true,
            data: preview,
        });
    }
);