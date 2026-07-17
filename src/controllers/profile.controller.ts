import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import profileService from "../services/profile.service";

export const getProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const profile = await profileService.getProfile(
            req.user.id
        );

        res.json({
            success: true,
            data: profile,
        });
    }
);

export const updateProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const profile =
            await profileService.updateProfile(
                req.user.id,
                req.body.name
            );

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: profile,
        });
    }
);

export const changePassword = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            currentPassword,
            newPassword,
        } = req.body;

        await profileService.changePassword(
            req.user.id,
            currentPassword,
            newPassword
        );

        res.json({
            success: true,
            message: "Password changed successfully",
        });
    }
);