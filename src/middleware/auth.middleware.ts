import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../prisma/client";

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const payload = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: {
                id: payload.userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = user;

        next();

    } catch {

        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });

    }
}