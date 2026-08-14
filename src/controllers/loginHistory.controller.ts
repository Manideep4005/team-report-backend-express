import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import loginHistoryService from "../services/loginHistory.service";

export const getAll = asyncHandler(
    async (req: Request, res: Response) => {

        const page = Math.max(
            1,
            Number(req.query.page) || 1
        );

        const limit = Math.min(
            50,
            Math.max(
                1,
                Number(req.query.limit) || 10
            )
        );

        const history =
            await loginHistoryService.getAll(
                page,
                limit
            );

        res.json({
            success: true,
            data: history,
        });
    }
);