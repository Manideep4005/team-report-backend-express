import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../prisma/client";
import { AuthUser } from "../types/express";

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

                role: {
                    select: {
                        id: true,
                        name: true,

                        permissions: {
                            select: {
                                permission: {
                                    select: {
                                        code: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        const authUser: AuthUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,

            role: {
                id: user.role.id,
                name: user.role.name,
                permissions: user.role.permissions.map(
                    ({ permission }) => ({
                        code: permission.code,
                    })
                ),
            },
        };

        req.user = authUser;


        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
}