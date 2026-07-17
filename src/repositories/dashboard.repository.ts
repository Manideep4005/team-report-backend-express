import { prisma } from "../prisma/client";

class DashboardRepository {

    async getUsers() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
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
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
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