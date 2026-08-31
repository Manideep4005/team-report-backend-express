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

export const resetPassword = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {

        const { id } = req.params;


        if (!id) {

            res.status(400).json({

                success: false,

                message:
                    "User ID is required.",

            });

            return;
        }


        await userService.resetPassword(
            id as any
        );


        res.json({

            success: true,

            message:
                "Password reset to the default password successfully.",

        });

    }
);

export const getInactive = asyncHandler(
    async (req: Request, res: Response) => {

        const users =
            await userService.getInactive();

        res.json({
            success: true,
            data: users,
        });
    }
);

export const restore = asyncHandler(
    async (req: Request, res: Response) => {

        const user =
            await userService.restore(
                req.params.id as string
            );

        res.json({
            success: true,
            message: "User restored successfully",
            data: user,
        });
    }
);