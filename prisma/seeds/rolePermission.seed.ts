import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedRolePermissions() {
    const roles = await prisma.role.findMany();

    const permissions = await prisma.permission.findMany();

    const roleMap = new Map(
        roles.map((r) => [r.name, r.id])
    );

    const permissionMap = new Map(
        permissions.map((p) => [p.code, p.id])
    );

    const mappings: Record<string, string[]> = {
        SUPER_ADMIN: permissions.map((p) => p.code),

        ADMIN: [
            "USER_CREATE",
            "USER_UPDATE",
            "USER_DELETE",
            "USER_VIEW",

            "ROLE_VIEW",

            "REPORT_CREATE",
            "REPORT_UPDATE",
            "REPORT_DELETE",
            "REPORT_VIEW_ALL",
        ],

        MANAGER: [
            "REPORT_CREATE",
            "REPORT_UPDATE",
            "REPORT_VIEW_OWN",

            "REPORT_VIEW_ALL",
            "REPORT_APPROVE",
        ],

        EMPLOYEE: [
            "REPORT_CREATE",
            "REPORT_UPDATE",
            "REPORT_VIEW_OWN",
        ],
    };

    for (const [roleName, permissionCodes] of Object.entries(mappings)) {
        const roleId = roleMap.get(roleName);

        if (!roleId) continue;

        for (const code of permissionCodes) {
            const permissionId = permissionMap.get(code);

            if (!permissionId) continue;

            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId,
                        permissionId,
                    },
                },
                update: {},
                create: {
                    roleId,
                    permissionId,
                },
            });
        }
    }

    console.log("✅ Role permissions seeded");
}