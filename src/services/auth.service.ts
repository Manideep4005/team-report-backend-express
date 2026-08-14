import { ApiError } from "../utils/ApiError";
import { comparePassword, hashPassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import userRepository from "../repositories/user.repository";
import { prisma } from "../prisma/client";
import loginHistoryRepository from "../repositories/loginHistory.repository";
import { Request } from "express";

class AuthService {

    async register(
        name: string,
        email: string,
        password: string
    ) {
        const existing = await userRepository.findByEmail(email);

        if (existing) {
            throw new ApiError(409, "Email already exists");
        }

        const employeeRole = await prisma.role.findUnique({
            where: {
                name: "EMPLOYEE",
            },
        });

        if (!employeeRole) {
            throw new ApiError(
                500,
                "Default EMPLOYEE role is not configured"
            );
        }

        const hashed = await hashPassword(password);

        const user = await userRepository.create({
            name,
            email,
            password: hashed,
            roleId: employeeRole.id,
        });

        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        return {
            user,
            token,
        };
    }

    async login(email: string, password: string, req: Request) {

        const ipAddress =
            req.headers["x-forwarded-for"]
                ?.toString()
                .split(",")[0]
                .trim() ||
            req.socket.remoteAddress ||
            null;

        // Get browser/device information
        const userAgent =
            req.headers["user-agent"] || null;

        const user = await userRepository.findByEmail(email);

        if (!user) {

            await loginHistoryRepository.create({
                email,
                status: "FAILED",
                ipAddress: ipAddress ?? undefined,
                userAgent: userAgent ?? undefined,
            });

            throw new ApiError(401, "Invalid credentials");
        }

        const matched = await comparePassword(
            password,
            user.password
        );

        if (!matched) {

            await loginHistoryRepository.create({
                userId: user.id,
                email,
                status: "FAILED",
                ipAddress: ipAddress ?? undefined,
                userAgent: userAgent ?? undefined,
            });

            throw new ApiError(401, "Invalid credentials");
        }

        await loginHistoryRepository.create({
            userId: user.id,
            email,
            status: "SUCCESS",
            ipAddress: ipAddress ?? undefined,
            userAgent: userAgent ?? undefined,
        });

        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        const mappedUser = {
            id: user.id,
            name: user.name,
            email: user.email,

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

        return {
            user: mappedUser,
            token,
        };
    }
}

export default new AuthService();