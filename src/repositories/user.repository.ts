import { prisma } from "../prisma/client";

export class UserRepository {

    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: {
                email,
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

    async findById(id: string) {
        return prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    async findByIdWithRole(id: string) {
        return prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                name: true,
                email: true,
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

    async findAll() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
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

    async findRoleById(roleId: string) {
        return prisma.role.findUnique({
            where: {
                id: roleId,
            },
        });
    }

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

    async delete(id: string) {
        return prisma.user.delete({
            where: {
                id,
            },
        });
    }
}

export default new UserRepository();