import { prisma } from "../prisma/client";

export class UserRepository {

    /* ============================================================
       ACTIVE USER BY EMAIL
    ============================================================ */

    async findByEmail(email: string) {
        return prisma.user.findFirst({
            where: {
                email,
                deletedAt: null,
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
    }


    /* ============================================================
       ACTIVE USER BY ID
    ============================================================ */

    async findById(id: string) {
        return prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }


    /* ============================================================
       ACTIVE USER BY ID WITH ROLE
    ============================================================ */

    async findByIdWithRole(id: string) {
        return prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                roleId: true,

                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },

                createdAt: true,
                updatedAt: true,
            },
        });
    }


    /* ============================================================
       GET ALL ACTIVE USERS
    ============================================================ */

    async findAll() {
        return prisma.user.findMany({
            where: {
                deletedAt: null,
            },

            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                roleId: true,

                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },

                createdAt: true,
                updatedAt: true,
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    }


    /* ============================================================
       GET ALL INACTIVE / DELETED USERS
    ============================================================ */

    async findInactive() {
        return prisma.user.findMany({
            where: {
                deletedAt: {
                    not: null,
                },
            },

            select: {
                id: true,
                name: true,
                email: true,
                roleId: true,
                avatarUrl: true,

                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },

                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            },

            orderBy: {
                deletedAt: "desc",
            },
        });
    }


    /* ============================================================
       FIND USER INCLUDING DELETED
    ============================================================ */

    async findByIdIncludingDeleted(id: string) {
        return prisma.user.findUnique({
            where: {
                id,
            },

            select: {
                id: true,
                name: true,
                email: true,
                roleId: true,
                avatarUrl: true,

                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },

                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            },
        });
    }


    /* ============================================================
       CREATE
    ============================================================ */

    async create(data: {
        name: string;
        email: string;
        password: string;
        roleId: string;
    }) {
        return prisma.user.create({
            data,

            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                roleId: true,

                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },

                createdAt: true,
                updatedAt: true,
            },
        });
    }


    /* ============================================================
       UPDATE
    ============================================================ */

    async update(
        id: string,
        data: {
            name?: string;
            email?: string;
            roleId?: string;
        }
    ) {
        return prisma.user.update({
            where: {
                id,
            },

            data,

            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                roleId: true,

                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },

                createdAt: true,
                updatedAt: true,
            },
        });
    }


    /* ============================================================
       UPDATE PASSWORD
    ============================================================ */

    async updatePassword(
        id: string,
        password: string
    ) {
        return prisma.user.update({
            where: {
                id,
            },

            data: {
                password,
            },
        });
    }


    /* ============================================================
       SOFT DELETE
    ============================================================ */

    async softDelete(id: string) {
        return prisma.user.update({
            where: {
                id,
            },

            data: {
                deletedAt: new Date(),
            },
        });
    }


    /* ============================================================
       RESTORE
    ============================================================ */

    async restore(id: string) {
        return prisma.user.update({
            where: {
                id,
            },

            data: {
                deletedAt: null,
            },

            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                roleId: true,

                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },

                createdAt: true,
                updatedAt: true,
            },
        });
    }


    /* ============================================================
       ROLE
    ============================================================ */

    async findRoleById(roleId: string) {
        return prisma.role.findUnique({
            where: {
                id: roleId,
            },
        });
    }


    /* ============================================================
       EMAIL INCLUDING DELETED
    ============================================================ */

    async findByEmailIncludingDeleted(email: string) {
        return prisma.user.findUnique({
            where: {
                email,
            },
        });
    }
}

export default new UserRepository();