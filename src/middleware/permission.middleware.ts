import { NextFunction, Request, Response } from "express";

export function requirePermission(permissionCode: string) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const hasPermission =
            req.user.role.permissions.some(
                permission => permission.code === permissionCode
            );

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: "Forbidden",
            });
        }

        next();
    };
}