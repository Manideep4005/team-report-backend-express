
import { Request } from "express";
import { prisma } from "../prisma/client";
import loginHistoryRepository from "../repositories/loginHistory.repository";
import userRepository from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { generateToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";

class AuthService {
    private normalizeUsername(value: string): string {
        return value.trim().toLowerCase();
    }

    private validateUsername(username: string): void {
        if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
            throw new ApiError(
                400,
                "Username must be 3-30 characters and contain only letters, numbers, dots, underscores, or hyphens",
            );
        }
    }

    private async generateAvailableUsername(
        preferredUsername: string,
    ): Promise<string> {
        const base = preferredUsername
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, "")
            .slice(0, 24);

        const safeBase = base.length >= 3 ? base : "user";

        for (let attempt = 0; attempt < 100; attempt++) {
            const suffix =
                attempt === 0 ? "" : String(attempt + 1);

            const candidate =
                `${safeBase.slice(0, 30 - suffix.length)}${suffix}`;

            const existing =
                await userRepository.findByUsernameIncludingDeleted(
                    candidate,
                );

            if (!existing) {
                return candidate;
            }
        }

        throw new ApiError(
            409,
            "Unable to generate a unique username. Please provide one manually.",
        );
    }

    async register(
        name: string,
        email: string,
        password: string,
        requestedUsername?: string,
    ) {
        const normalizedEmail = email.trim().toLowerCase();

        const existingEmail =
            await userRepository.findByEmailIncludingDeleted(
                normalizedEmail,
            );

        if (existingEmail) {
            throw new ApiError(409, "Email already exists");
        }

        let username: string;

        if (requestedUsername?.trim()) {
            username = this.normalizeUsername(requestedUsername);
            this.validateUsername(username);

            const existingUsername =
                await userRepository.findByUsernameIncludingDeleted(
                    username,
                );

            if (existingUsername) {
                throw new ApiError(409, "Username already exists");
            }
        } else {
            const emailPrefix = normalizedEmail.split("@")[0];

            username =
                await this.generateAvailableUsername(emailPrefix);
        }

        const employeeRole = await prisma.role.findUnique({
            where: { name: "EMPLOYEE" },
        });

        if (!employeeRole) {
            throw new ApiError(
                500,
                "Default EMPLOYEE role is not configured",
            );
        }

        const hashed = await hashPassword(password);

        const user = await userRepository.create({
            name: name.trim(),
            username,
            email: normalizedEmail,
            password: hashed,
            roleId: employeeRole.id,
        });

        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        return { user, token };
    }

    async login(
        identifier: string,
        password: string,
        req: Request,
    ) {


        const ipAddress =
            req.headers["x-forwarded-for"]
                ?.toString()
                .split(",")[0]
                .trim() ||
            req.socket.remoteAddress ||
            null;

        const userAgent = req.headers["user-agent"] || null;

        // Do not log the password or password hash.
        console.log("Login attempt:", {
            identifier,
            ipAddress,
        });

        const user =
            await userRepository.findByIdentifier(
                identifier,
            );

        if (!user) {
            await this.recordLoginAttempt({
                email: identifier,
                status: "FAILED",
                ipAddress,
                userAgent,
            });

            throw new ApiError(401, "Invalid credentials");
        }

        const matched = await comparePassword(
            password,
            user.password,
        );

        if (!matched) {
            await this.recordLoginAttempt({
                userId: user.id,
                email: user.email,
                status: "FAILED",
                ipAddress,
                userAgent,
            });

            throw new ApiError(401, "Invalid credentials");
        }

        await this.recordLoginAttempt({
            userId: user.id,
            email: user.email,
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
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            role: {
                id: user.role.id,
                name: user.role.name,
                permissions: user.role.permissions.map(
                    ({ permission }) => ({
                        code: permission.code,
                    }),
                ),
            },
        };

        return {
            user: mappedUser,
            token,
        };
    }

    private async recordLoginAttempt(data: {
        userId?: string;
        email: string;
        status: "SUCCESS" | "FAILED";
        ipAddress?: string | null;
        userAgent?: string | null;
    }) {
        try {
            await loginHistoryRepository.create(data);
        } catch (error) {
            // A history failure should not expose credentials or
            // prevent a valid login from completing.
            console.error("Failed to store login history:", error);
        }
    }
}

export default new AuthService();
