import { prisma } from "../prisma/client";

class SummaryRepository {

    async getUsers() {
        return prisma.user.findMany({
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
                user: true,
            },
        });
    }

}

export default new SummaryRepository();