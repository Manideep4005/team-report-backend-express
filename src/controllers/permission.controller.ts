import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import permissionService from "../services/permission.service";

export const getAll = asyncHandler(
    async (req: Request, res: Response) => {
        const permissions =
            await permissionService.getAll();

        res.json({
            success: true,
            data: permissions,
        });
    }
);