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
    async findAll(
        where?: any,
        page = 1,
        limit = 10
    ) {
        const skip =
            (page - 1) * limit;

        const [
            reports,
            total,
        ] = await Promise.all([
            prisma.workReport.findMany({
                where,

                orderBy: {
                    reportDate: "desc",
                },

                skip,

                take: limit,

                select: {
                    id: true,
                    description: true,
                    reportDate: true,
                    createdAt: true,
                    updatedAt: true,

                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),

            prisma.workReport.count({
                where,
            }),
        ]);

        const totalPages =
            Math.ceil(total / limit);

        return {
            reports,

            pagination: {
                page,
                limit,
                total,
                totalPages,

                hasNextPage:
                    page < totalPages,

                hasPreviousPage:
                    page > 1,
            },
        };
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
    async history(
        userId: string,
        where?: any,
        page = 1,
        limit = 10
    ) {
        const skip =
            (page - 1) * limit;

        const finalWhere = {
            userId,
            ...where,
        };

        const [
            reports,
            total,
        ] = await Promise.all([
            prisma.workReport.findMany({
                where: finalWhere,

                orderBy: {
                    reportDate: "desc",
                },

                skip,

                take: limit,

                select: {
                    id: true,
                    description: true,
                    reportDate: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),

            prisma.workReport.count({
                where: finalWhere,
            }),
        ]);

        const totalPages =
            Math.ceil(total / limit);

        return {
            reports,

            pagination: {
                page,
                limit,
                total,
                totalPages,

                hasNextPage:
                    page < totalPages,

                hasPreviousPage:
                    page > 1,
            },
        };
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