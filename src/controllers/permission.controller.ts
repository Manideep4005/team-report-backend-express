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

export const getById = asyncHandler(
    async (req: Request, res: Response) => {

        const permission =
            await permissionService.getById(
                req.params.id as string
            );

        res.json({
            success: true,
            data: permission,
        });
    }
);

export const create = asyncHandler(
    async (req: Request, res: Response) => {

        const permission =
            await permissionService.create(
                req.body.code,
                req.body.name,
                req.body.description
            );

        res.status(201).json({
            success: true,
            message: "Permission created successfully",
            data: permission,
        });
    }
);

export const update = asyncHandler(
    async (req: Request, res: Response) => {

        const permission =
            await permissionService.update(
                req.params.id as string,
                {
                    code: req.body.code,
                    name: req.body.name,
                    description: req.body.description,
                }
            );

        res.json({
            success: true,
            message: "Permission updated successfully",
            data: permission,
        });
    }
);

export const remove = asyncHandler(
    async (req: Request, res: Response) => {

        await permissionService.delete(
            req.params.id as string
        );

        res.json({
            success: true,
            message: "Permission deleted successfully",
        });
    }
);