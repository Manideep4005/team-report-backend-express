import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedUserRoles() {
    const employeeRole = await prisma.role.findUnique({
        where: {
            name: "EMPLOYEE",
        },
    });

    if (!employeeRole) {
        throw new Error("EMPLOYEE role not found");
    }

    // Assign EMPLOYEE role to users who don't have a role yet
    await prisma.user.updateMany({
        where: {
            roleId: null as any,
        },
        data: {
            roleId: employeeRole.id,
        },
    });

    console.log("✅ Assigned EMPLOYEE role to existing users");
}