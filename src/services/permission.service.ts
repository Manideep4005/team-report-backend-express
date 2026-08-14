import permissionRepository from "../repositories/permission.repository";
import { ApiError } from "../utils/ApiError";

class PermissionService {

    async getAll() {
        return permissionRepository.findAll();
    }

    async getById(id: string) {
        const permission =
            await permissionRepository.findById(id);

        if (!permission) {
            throw new ApiError(
                404,
                "Permission not found"
            );
        }

        return permission;
    }

    async create(
        code: string,
        name: string,
        description?: string
    ) {
        const existing =
            await permissionRepository.findByCode(code);

        if (existing) {
            throw new ApiError(
                409,
                "Permission code already exists"
            );
        }

        return permissionRepository.create({
            code,
            name,
            description,
        });
    }

    async update(
        id: string,
        data: {
            code?: string;
            name?: string;
            description?: string;
        }
    ) {
        const permission =
            await permissionRepository.findById(id);

        if (!permission) {
            throw new ApiError(
                404,
                "Permission not found"
            );
        }

        if (
            data.code &&
            data.code !== permission.code
        ) {
            const existing =
                await permissionRepository.findByCode(
                    data.code
                );

            if (existing) {
                throw new ApiError(
                    409,
                    "Permission code already exists"
                );
            }
        }

        return permissionRepository.update(
            id,
            data
        );
    }

    async delete(id: string) {
        const permission =
            await permissionRepository.findById(id);

        if (!permission) {
            throw new ApiError(
                404,
                "Permission not found"
            );
        }

        const roleCount =
            await permissionRepository.countRoles(id);

        if (roleCount > 0) {
            throw new ApiError(
                409,
                "Cannot delete permission assigned to roles"
            );
        }

        await permissionRepository.delete(id);
    }
}

export default new PermissionService();