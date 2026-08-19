import { prisma } from "../prisma/client";

class PublicMonitorRepository {

    async create(data: {
        tokenHash: string;
        createdById: string;
        expiresAt: Date | null;
    }) {
        return prisma.publicMonitorLink.create({
            data: {
                tokenHash: data.tokenHash,
                createdById: data.createdById,
                expiresAt: data.expiresAt,
            },

            select: {
                id: true,
                expiresAt: true,
                isActive: true,
                createdAt: true,
            },
        });
    }


    async findByTokenHash(tokenHash: string) {
        return prisma.publicMonitorLink.findUnique({
            where: {
                tokenHash,
            },
        });
    }


    async findById(id: string) {
        return prisma.publicMonitorLink.findUnique({
            where: {
                id,
            },
        });
    }


    async revoke(
        id: string,
        revokedById: string
    ) {
        return prisma.publicMonitorLink.update({
            where: {
                id,
            },

            data: {
                isActive: false,
                revokedAt: new Date(),
                revokedById,
            },

            select: {
                id: true,
                isActive: true,
                revokedAt: true,
            },
        });
    }


    async findAll() {
        return prisma.publicMonitorLink.findMany({
            orderBy: {
                createdAt: "desc",
            },

            select: {
                id: true,
                expiresAt: true,
                isActive: true,
                createdAt: true,
                revokedAt: true,

                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                revokedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async findUserReportsByDate(
        start: Date,
        end: Date
    ) {
        return prisma.workReport.findMany({
            where: {
                reportDate: {
                    gte: start,
                    lt: end,
                },
            },

            orderBy: {
                reportDate: "desc",
            },

            select: {
                id: true,
                reportDate: true,
                description: true,
                createdAt: true,
                updatedAt: true,

                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }


    async findTeamMembers() {
        return prisma.user.findMany({
            orderBy: {
                name: "asc",
            },

            select: {
                id: true,
                name: true,
            },
        });
    }
}

export default new PublicMonitorRepository();