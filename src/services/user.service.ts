import userRepository from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "../utils/password";

class UserService {

    async getAll() {
        return userRepository.findAll();
    }

    async getById(id: string) {
        const user = await userRepository.findByIdWithRole(id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return user;
    }

    async create(
        name: string,
        email: string,
        password: string,
        roleId: string,
        currentUserRole: string
    ) {
        const existing = await userRepository.findByEmail(email);

        if (existing) {
            throw new ApiError(409, "Email already exists");
        }

        const role = await userRepository.findRoleById(roleId);

        if (!role) {
            throw new ApiError(400, "Invalid role");
        }

        if (
            role.name === "SUPER_ADMIN" &&
            currentUserRole !== "SUPER_ADMIN"
        ) {
            throw new ApiError(
                403,
                "Only SUPER_ADMIN can assign SUPER_ADMIN role"
            );
        }

        const hashedPassword = await hashPassword(password);

        return userRepository.create({
            name,
            email,
            password: hashedPassword,
            roleId,
        });
    }

    async update(
        id: string,
        data: {
            name?: string;
            email?: string;
            roleId?: string;
        }
    ) {
        const user = await userRepository.findById(id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (data.email && data.email !== user.email) {
            const existing =
                await userRepository.findByEmail(data.email);

            if (existing) {
                throw new ApiError(
                    409,
                    "Email already exists"
                );
            }
        }

        if (data.roleId) {
            const role =
                await userRepository.findRoleById(data.roleId);

            if (!role) {
                throw new ApiError(400, "Invalid role");
            }
        }

        return userRepository.update(id, data);
    }

    async delete(id: string, currentUserId: string) {
        const user = await userRepository.findById(id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (id === currentUserId) {
            throw new ApiError(
                400,
                "You cannot delete your own account"
            );
        }

        await userRepository.delete(id);
    }
}

export default new UserService();