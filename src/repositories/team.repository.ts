import { prisma } from "../prisma/client";

class TeamRepository {

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
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });
    }

}

export default new TeamRepository();