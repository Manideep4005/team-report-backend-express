import { prisma } from "../prisma/client";
import { LoginStatus } from "@prisma/client";

class LoginHistoryRepository {

    async create(data: {
        userId?: string | null;
        email: string;
        status: LoginStatus;
        ipAddress?: string | null;
        userAgent?: string | null;
    }) {
        return prisma.loginHistory.create({
            data,
        });
    }

    async findAll(skip: number, take: number) {
        const [items, total] = await Promise.all([
            prisma.loginHistory.findMany({
                skip,
                take,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            }),

            prisma.loginHistory.count(),
        ]);

        return {
            items,
            total,
        };
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