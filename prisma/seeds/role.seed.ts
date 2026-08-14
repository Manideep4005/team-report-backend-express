import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedRoles() {
    const roles = [
        {
            name: "SUPER_ADMIN",
            description: "Full system access",
        },
        {
            name: "ADMIN",
            description: "System administrator",
        },
        {
            name: "MANAGER",
            description: "Manager",
        },
        {
            name: "EMPLOYEE",
            description: "Employee",
        },
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: {
                name: role.name,
            },
            update: {},
            create: role,
        });
    }

    console.log("✅ Roles seeded");
}