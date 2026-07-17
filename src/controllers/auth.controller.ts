import { Request, Response } from "express";
import authService from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { cookieOptions } from "../config/cookie";

export const register = asyncHandler(async (req: Request, res: Response) => {

    const { name, email, password } = req.body;

    const result = await authService.register(
        name,
        email,
        password
    );

    res.cookie("token", result.token, cookieOptions);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: result.user,
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {

    const { email, password } = req.body;

    const result = await authService.login(
        email,
        password
    );

    res.cookie("token", result.token, cookieOptions);

    res.json({
        success: true,
        message: "Login successful",
        user: result.user,
    });
});

export const logout = (_: Request, res: Response) => {

    res.clearCookie("token");

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