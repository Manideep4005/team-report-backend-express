import roleRepository from "../repositories/role.repository";
import { ApiError } from "../utils/ApiError";

class RoleService {

    async getAll() {
        return roleRepository.findAll();
    }

    async getById(id: string) {
        const role = await roleRepository.findById(id);

        if (!role) {
            throw new ApiError(404, "Role not found");
        }

        return role;
    }

    async create(
        name: string,
        description: string | undefined,
        permissionIds: string[]
    ) {
        const existing =
            await roleRepository.findByName(name);

        if (existing) {
            throw new ApiError(
                409,
                "Role already exists"
            );
        }

        await this.validatePermissions(permissionIds);

        return roleRepository.create(
            name,
            description,
            permissionIds
        );
    }

    async update(
        id: string,
        data: {
            name?: string;
            description?: string;
        },
        permissionIds: string[]
    ) {
        const existingRole =
            await roleRepository.findById(id);

        if (!existingRole) {
            throw new ApiError(
                404,
                "Role not found"
            );
        }

        if (
            data.name &&
            data.name !== existingRole.name
        ) {
            const existing =
                await roleRepository.findByName(data.name);

            if (existing) {
                throw new ApiError(
                    409,
                    "Role already exists"
                );
            }
        }

        await this.validatePermissions(permissionIds);

        return roleRepository.update(
            id,
            data,
            permissionIds
        );
    }

    async delete(id: string) {
        const role =
            await roleRepository.findById(id);

        if (!role) {
            throw new ApiError(
                404,
                "Role not found"
            );
        }

        const userCount =
            await roleRepository.countUsers(id);

        if (userCount > 0) {
            throw new ApiError(
                409,
                "Cannot delete role assigned to users"
            );
        }

        await roleRepository.delete(id);
    }

    private async validatePermissions(
        permissionIds: string[]
    ) {
        const uniqueIds = [
            ...new Set(permissionIds),
        ];

        if (uniqueIds.length === 0) {
            return;
        }

        const permissions =
            await roleRepository.findPermissionsByIds(
                uniqueIds
            );

        if (
            permissions.length !== uniqueIds.length
        ) {
            throw new ApiError(
                400,
                "One or more permissions are invalid"
            );
        }
    }
}

export default new RoleService();