import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import profileService from "../services/profile.service";
import { ApiError } from "../utils/ApiError";

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

export const updateAvatar = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {
        if (!req.file) {
            throw new ApiError(
                400,
                "Please select an image"
            );
        }

        const profile =
            await profileService.updateAvatar(
                req.user.id,
                req.file.buffer
            );

        res.json({
            success: true,
            message:
                "Avatar updated successfully",
            data: profile,
        });
    }
);

export const removeAvatar = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {
        const profile =
            await profileService.removeAvatar(
                req.user.id
            );

        res.json({
            success: true,
            message:
                "Avatar removed successfully",
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