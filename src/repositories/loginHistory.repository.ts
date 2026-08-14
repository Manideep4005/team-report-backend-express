import { prisma } from "../prisma/client";
import { LoginStatus } from "@prisma/client";

class LoginHistoryRepository {

    async create(data: {
        userId?: string;
        email: string;
        status: LoginStatus;
        ipAddress?: string;
        userAgent?: string;
    }) {
        return prisma.loginHistory.create({
            data,
        });
    }

    async findAll() {
        return prisma.loginHistory.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findByUserId(userId: string) {
        return prisma.loginHistory.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
}

export default new LoginHistoryRepository();