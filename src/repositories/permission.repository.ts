import { prisma } from "../prisma/client";

class PermissionRepository {

    async findAll() {
        return prisma.permission.findMany({
            orderBy: {
                code: "asc",
            },
            select: {
                id: true,
                code: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,

                _count: {
                    select: {
                        roles: true,
                    },
                },
            },
        });
    }

    async findById(id: string) {
        return prisma.permission.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                code: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,

                _count: {
                    select: {
                        roles: true,
                    },
                },
            },
        });
    }

    async findByCode(code: string) {
        return prisma.permission.findUnique({
            where: {
                code,
            },
        });
    }

    async create(data: {
        code: string;
        name: string;
        description?: string;
    }) {
        return prisma.permission.create({
            data,
            select: {
                id: true,
                code: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async update(
        id: string,
        data: {
            code?: string;
            name?: string;
            description?: string;
        }
    ) {
        return prisma.permission.update({
            where: {
                id,
            },
            data,
            select: {
                id: true,
                code: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async delete(id: string) {
        return prisma.permission.delete({
            where: {
                id,
            },
        });
    }

    async countRoles(id: string) {
        return prisma.rolePermission.count({
            where: {
                permissionId: id,
            },
        });
    }
}

export default new PermissionRepository();