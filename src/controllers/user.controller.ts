import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import userService from "../services/user.service";

export const getAll = asyncHandler(
    async (req: Request, res: Response) => {
        const users = await userService.getAll();

        res.json({
            success: true,
            data: users,
        });
    }
);

export const getById = asyncHandler(
    async (req: Request, res: Response) => {
        const user = await userService.getById(
            req.params.id as any
        );

        res.json({
            success: true,
            data: user,
        });
    }
);

export const create = asyncHandler(
    async (req: Request, res: Response) => {
        const user = await userService.create(
            req.body.name,
            req.body.email,
            req.body.password,
            req.body.roleId,
            req.user.role.name as any
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });
    }
);

export const update = asyncHandler(
    async (req: Request, res: Response) => {
        const user = await userService.update(
            req.params.id as any,
            {
                name: req.body.name,
                email: req.body.email,
                roleId: req.body.roleId,
            }
        );

        res.json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    }
);

export const remove = asyncHandler(
    async (req: Request, res: Response) => {
        await userService.delete(
            req.params.id as any,
            req.user.id
        );

        res.json({
            success: true,
            message: "User deleted successfully",
        });
    }
);