import { prisma } from "../prisma/client";

class RoleRepository {

    async findAll() {
        return prisma.role.findMany({
            orderBy: {
                createdAt: "asc",
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,

                permissions: {
                    select: {
                        permission: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                            },
                        },
                    },
                },

                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });
    }

    async findById(id: string) {
        return prisma.role.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,

                permissions: {
                    select: {
                        permission: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                },

                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });
    }

    async findByName(name: string) {
        return prisma.role.findUnique({
            where: {
                name,
            },
        });
    }

    async create(
        name: string,
        description: string | undefined,
        permissionIds: string[]
    ) {
        return prisma.$transaction(async (tx) => {
            const role = await tx.role.create({
                data: {
                    name,
                    description,
                },
            });

            if (permissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissionIds.map((permissionId) => ({
                        roleId: role.id,
                        permissionId,
                    })),
                    skipDuplicates: true,
                });
            }

            return tx.role.findUnique({
                where: {
                    id: role.id,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,

                    permissions: {
                        select: {
                            permission: {
                                select: {
                                    id: true,
                                    code: true,
                                    name: true,
                                },
                            },
                        },
                    },

                    createdAt: true,
                    updatedAt: true,
                },
            });
        });
    }

    async update(
        id: string,
        data: {
            name?: string;
            description?: string;
        },
        permissionIds: string[]
    ) {
        return prisma.$transaction(async (tx) => {

            await tx.role.update({
                where: {
                    id,
                },
                data,
            });

            await tx.rolePermission.deleteMany({
                where: {
                    roleId: id,
                },
            });

            if (permissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissionIds.map((permissionId) => ({
                        roleId: id,
                        permissionId,
                    })),
                    skipDuplicates: true,
                });
            }

            return tx.role.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,

                    permissions: {
                        select: {
                            permission: {
                                select: {
                                    id: true,
                                    code: true,
                                    name: true,
                                },
                            },
                        },
                    },

                    createdAt: true,
                    updatedAt: true,
                },
            });
        });
    }

    async delete(id: string) {
        return prisma.role.delete({
            where: {
                id,
            },
        });
    }

    async countUsers(id: string) {
        return prisma.user.count({
            where: {
                roleId: id,
            },
        });
    }

    async findPermissionsByIds(permissionIds: string[]) {
        return prisma.permission.findMany({
            where: {
                id: {
                    in: permissionIds,
                },
            },
            select: {
                id: true,
                code: true,
                name: true,
            },
        });
    }
}

export default new RoleRepository();