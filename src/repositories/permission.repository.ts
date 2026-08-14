import { prisma } from "../prisma/client";

class PermissionRepository {
    async findAll() {
        return prisma.permission.findMany({
            orderBy: [
                {
                    code: "asc",
                },
            ],
            select: {
                id: true,
                code: true,
                name: true,
                description: true,
            },
        });
    }
}

export default new PermissionRepository();