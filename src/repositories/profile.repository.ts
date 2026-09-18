import { prisma } from "../prisma/client";

class ProfileRepository {
    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    async updateProfile(id: string, name: string) {
        return prisma.user.update({
            where: { id },
            data: { name },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async updateAvatar(
        id: string,
        avatarUrl: string
    ) {
        return prisma.user.update({
            where: {
                id,
            },

            data: {
                avatarUrl,
            },

            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async removeAvatar(id: string) {
        return prisma.user.update({
            where: {
                id,
            },

            data: {
                avatarUrl: null,
            },

            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }


    async updatePassword(id: string, password: string) {
        return prisma.user.update({
            where: { id },
            data: {
                password,
            },
        });
    }
}

export default new ProfileRepository();