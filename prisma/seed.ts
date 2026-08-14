import { PrismaClient } from "@prisma/client";
import { seedRoles } from "./seeds/role.seed";
import { seedPermissions } from "./seeds/permission.seed";
import { seedRolePermissions } from "./seeds/rolePermission.seed";
import { seedUserRoles } from "./seeds/userRole.seed";



const prisma = new PrismaClient();

async function main() {
    await seedRoles();

    await seedPermissions();

    await seedRolePermissions();

    await seedUserRoles();
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);

        await prisma.$disconnect();

        process.exit(1);
    });