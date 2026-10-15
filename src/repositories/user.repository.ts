
import { prisma } from "../prisma/client";

const userResponseSelect = {
    id: true,
    name: true,
    username: true,
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
};

export class UserRepository {
    async findByEmail(email: string) {
        return prisma.user.findFirst({
            where: {
                email: email,
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

    async findByUsername(username: string) {
        return prisma.user.findFirst({
            where: {
                username: username,
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

    async findByIdentifier(identifier: string) {

        return prisma.user.findFirst({
            where: {
                deletedAt: null,
                OR: [
                    { username: identifier },
                    { email: identifier },
                ],
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
        return prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }

    async findByIdWithRole(id: string) {
        return prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: userResponseSelect,
        });
    }

    async findAll() {
        return prisma.user.findMany({
            where: {
                deletedAt: null,
            },
            select: userResponseSelect,
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findInactive() {
        return prisma.user.findMany({
            where: {
                deletedAt: { not: null },
            },
            select: {
                id: true,
                name: true,
                username: true,
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

    async findByIdIncludingDeleted(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                username: true,
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

    async create(data: {
        name: string;
        username: string;
        email: string;
        password: string;
        roleId: string;
    }) {
        return prisma.user.create({
            data,
            select: userResponseSelect,
        });
    }

    async update(
        id: string,
        data: {
            name?: string;
            username?: string;
            email?: string;
            roleId?: string;
        },
    ) {
        return prisma.user.update({
            where: { id },
            data,
            select: userResponseSelect,
        });
    }

    async updatePassword(id: string, password: string) {
        return prisma.user.update({
            where: { id },
            data: { password },
        });
    }

    async softDelete(id: string) {
        return prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async restore(id: string) {
        return prisma.user.update({
            where: { id },
            data: { deletedAt: null },
            select: userResponseSelect,
        });
    }

    async findRoleById(roleId: string) {
        return prisma.role.findUnique({
            where: { id: roleId },
        });
    }

    async findByEmailIncludingDeleted(email: string) {
        return prisma.user.findUnique({
            where: { email: email },
        });
    }

    async findByUsernameIncludingDeleted(username: string) {
        return prisma.user.findUnique({
            where: { username: username },
        });
    }
}

export default new UserRepository();
