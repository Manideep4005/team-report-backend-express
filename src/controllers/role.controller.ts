import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import roleService from "../services/role.service";

export const getAll = asyncHandler(
    async (req: Request, res: Response) => {

        const roles =
            await roleService.getAll();

        res.json({
            success: true,
            data: roles,
        });
    }
);

export const getById = asyncHandler(
    async (req: Request, res: Response) => {

        const role =
            await roleService.getById(
                req.params.id as any
            );

        res.json({
            success: true,
            data: role,
        });
    }
);

export const create = asyncHandler(
    async (req: Request, res: Response) => {

        const role =
            await roleService.create(
                req.body.name,
                req.body.description,
                req.body.permissionIds
            );

        res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: role,
        });
    }
);

export const update = asyncHandler(
    async (req: Request, res: Response) => {

        const role =
            await roleService.update(
                req.params.id as any,
                {
                    name: req.body.name,
                    description: req.body.description,
                },
                req.body.permissionIds
            );

        res.json({
            success: true,
            message: "Role updated successfully",
            data: role,
        });
    }
);

export const remove = asyncHandler(
    async (req: Request, res: Response) => {

        await roleService.delete(
            req.params.id as any
        );

        res.json({
            success: true,
            message: "Role deleted successfully",
        });
    }
);