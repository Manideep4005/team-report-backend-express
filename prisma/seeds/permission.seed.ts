import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedPermissions() {
    const permissions = [
        {
            code: "USER_CREATE",
            name: "Create User",
        },
        {
            code: "USER_UPDATE",
            name: "Update User",
        },
        {
            code: "USER_DELETE",
            name: "Delete User",
        },
        {
            code: "USER_VIEW",
            name: "View Users",
        },
        {
            code: "ROLE_CREATE",
            name: "Create Role",
        },
        {
            code: "ROLE_UPDATE",
            name: "Update Role",
        },
        {
            code: "ROLE_DELETE",
            name: "Delete Role",
        },
        {
            code: "ROLE_VIEW",
            name: "View Roles",
        },
        {
            code: "REPORT_CREATE",
            name: "Create Report",
        },
        {
            code: "REPORT_UPDATE",
            name: "Update Report",
        },
        {
            code: "REPORT_DELETE",
            name: "Delete Report",
        },
        {
            code: "REPORT_VIEW_OWN",
            name: "View Own Reports",
        },
        {
            code: "REPORT_VIEW_ALL",
            name: "View All Reports",
        },
        {
            code: "REPORT_APPROVE",
            name: "Approve Reports",
        },
    ];

    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: {
                code: permission.code,
            },
            update: {},
            create: permission,
        });
    }

    console.log("✅ Permissions seeded");
}