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