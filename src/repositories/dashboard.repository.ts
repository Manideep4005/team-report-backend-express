import { prisma } from "../prisma/client";

class DashboardRepository {

    async getUsers() {
        return prisma.user.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
            },
            orderBy: {
                name: "asc",
            },
        });
    }

    async getTodayReports(start: Date, end: Date) {
        return prisma.workReport.findMany({
            where: {
                reportDate: {
                    gte: start,
                    lt: end,
                },
                user: {
                    deletedAt: null,
                },
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });
    }
}

export default new DashboardRepository();