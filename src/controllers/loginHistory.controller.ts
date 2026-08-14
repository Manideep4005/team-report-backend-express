import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import loginHistoryService from "../services/loginHistory.service";

export const getAll = asyncHandler(
    async (req: Request, res: Response) => {

        const history =
            await loginHistoryService.getAll();

        res.json({
            success: true,
            data: history,
        });
    }
);