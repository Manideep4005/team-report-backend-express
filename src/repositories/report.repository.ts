import { prisma } from "../prisma/client";

class ReportRepository {

    async findToday(userId: string, start: Date, end: Date) {
        return prisma.workReport.findFirst({
            where: {
                userId,
                reportDate: {
                    gte: start,
                    lt: end,
                },
            },
        });
    }

    async findByDate(
        userId: string,
        start: Date,
        end: Date
    ) {
        return prisma.workReport.findFirst({
            where: {
                userId,
                reportDate: {
                    gte: start,
                    lt: end,
                },
            },
        });
    }

    async create(userId: string, description: string, reportDate: Date) {
        return prisma.workReport.create({
            data: {
                userId,
                description,
                reportDate,
            },
        });
    }

    async update(id: string, description: string) {
        return prisma.workReport.update({
            where: { id },
            data: {
                description,
            },
        });
    }

    async history(userId: string, where?: any) {
        return prisma.workReport.findMany({
            where: {
                userId,
                ...where,
            },
            orderBy: {
                reportDate: "desc",
            },
            select: {
                id: true,
                description: true,
                reportDate: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async upsert(
        userId: string,
        description: string,
        reportDate: Date
    ) {
        return prisma.workReport.upsert({
            where: {
                userId_reportDate: {
                    userId,
                    reportDate,
                },
            },
            create: {
                userId,
                description,
                reportDate,
            },
            update: {
                description,
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
}

export default new ReportRepository();