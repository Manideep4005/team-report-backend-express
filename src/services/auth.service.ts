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

    async login(
        email: string,
        password: string,
        req: Request
    ) {
        const ipAddress =
            req.headers["x-forwarded-for"]
                ?.toString()
                .split(",")[0]
                .trim() ||
            req.socket.remoteAddress ||
            null;

        const userAgent =
            req.headers["user-agent"] || null;

        console.log("Login attempt:", {
            email,
            ipAddress,
        });


        const user =
            await userRepository.findByEmail(email);

        // --------------------------------
        // USER DOES NOT EXIST
        // --------------------------------

        if (!user) {
            console.log(
                "Login failed: user not found",
                email
            );

            await this.recordLoginAttempt({
                email,
                status: "FAILED",
                ipAddress,
                userAgent,
            });

            throw new ApiError(
                401,
                "Invalid credentials"
            );
        }

        // --------------------------------
        // PASSWORD DOES NOT MATCH
        // --------------------------------

        const matched = await comparePassword(
            password,
            user.password
        );

        console.log("PASSWORD MATCH RESULT:", matched);

        if (!matched) {
            console.log("WRONG PASSWORD - STORING HISTORY");

            await loginHistoryRepository.create({
                userId: user.id,
                email,
                status: "FAILED",
                ipAddress: ipAddress ?? undefined,
                userAgent: userAgent ?? undefined,
            });

            console.log("FAILED LOGIN HISTORY STORED");

            throw new ApiError(
                401,
                "Invalid credentials"
            );
        }
        // --------------------------------
        // SUCCESS
        // --------------------------------

        await this.recordLoginAttempt({
            userId: user.id,
            email,
            status: "SUCCESS",
            ipAddress,
            userAgent,
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

                permissions:
                    user.role.permissions.map(
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

    private async recordLoginAttempt(
        data: {
            userId?: string;
            email: string;
            status: "SUCCESS" | "FAILED";
            ipAddress?: string | null;
            userAgent?: string | null;
        }
    ) {
        try {
            await loginHistoryRepository.create(data);

            console.log(
                "Login history stored:",
                data.email,
                data.status
            );
        } catch (error) {
            console.error(
                "Failed to store login history:",
                error
            );
        }
    }
}

export default new AuthService();