
import { Request, Response } from "express";
import authService from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { cookieOptions } from "../config/cookie";

export const register = asyncHandler(
    async (req: Request, res: Response) => {
        const { name, username, email, password } = req.body;

        const result = await authService.register(
            name,
            email,
            password,
            username,
        );

        res.cookie("token", result.token, cookieOptions);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: result.user,
        });
    },
);

export const login = asyncHandler(
    async (req: Request, res: Response) => {
        // `email` remains supported for backward compatibility.
        const identifier = req.body.identifier ?? req.body.email;
        const { password } = req.body;

        if (
            typeof identifier !== "string" ||
            typeof password !== "string" ||
            !identifier.trim() ||
            !password
        ) {
            res.status(400).json({
                success: false,
                message: "Username/email and password are required.",
            });
            return;
        }

        const result = await authService.login(
            identifier,
            password,
            req,
        );

        res.cookie("token", result.token, cookieOptions);

        res.json({
            success: true,
            message: "Login successful",
            user: result.user,
        });
    },
);

export const logout = (_: Request, res: Response) => {
    res.clearCookie("token", cookieOptions);

    res.json({
        success: true,
        message: "Logged out successfully",
    });
};

export const me = (req: Request, res: Response) => {
    res.json({
        success: true,
        user: req.user,
    });
};
