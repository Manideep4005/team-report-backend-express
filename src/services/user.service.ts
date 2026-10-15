
import userRepository from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "../utils/password";

const DEFAULT_USER_PASSWORD = "test123";

class UserService {
    private normalizeUsername(value: string): string {
        return value.trim().toLowerCase();
    }

    private validateUsername(username: string): void {
        if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
            throw new ApiError(
                400,
                "Username must be 3-30 characters and contain only letters, numbers, dots, underscores, or hyphens",
            );
        }
    }

    private async generateAvailableUsername(
        preferred: string,
    ): Promise<string> {
        const base = preferred
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, "")
            .slice(0, 24);

        const safeBase = base.length >= 3 ? base : "user";

        for (let attempt = 0; attempt < 100; attempt++) {
            const suffix = attempt === 0 ? "" : String(attempt + 1);
            const candidate =
                `${safeBase.slice(0, 30 - suffix.length)}${suffix}`;

            const existing =
                await userRepository.findByUsernameIncludingDeleted(
                    candidate,
                );

            if (!existing) return candidate;
        }

        throw new ApiError(409, "Unable to generate a unique username");
    }

    async getAll() {
        return userRepository.findAll();
    }

    async getInactive() {
        return userRepository.findInactive();
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
        roleId: string,
        currentUserRole: string,
        requestedUsername?: string,
    ) {
        const normalizedEmail = email.trim().toLowerCase();

        const existingEmail =
            await userRepository.findByEmailIncludingDeleted(
                normalizedEmail,
            );

        if (existingEmail) {
            throw new ApiError(409, "Email already exists");
        }

        let username: string;

        if (requestedUsername?.trim()) {
            username = this.normalizeUsername(requestedUsername);
            this.validateUsername(username);

            const existingUsername =
                await userRepository.findByUsernameIncludingDeleted(
                    username,
                );

            if (existingUsername) {
                throw new ApiError(409, "Username already exists");
            }
        } else {
            username = await this.generateAvailableUsername(
                normalizedEmail.split("@")[0],
            );
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
                "Only SUPER_ADMIN can assign SUPER_ADMIN role",
            );
        }

        const hashedPassword = await hashPassword(
            DEFAULT_USER_PASSWORD,
        );

        return userRepository.create({
            name: name.trim(),
            username,
            email: normalizedEmail,
            password: hashedPassword,
            roleId,
        });
    }

    async update(
        id: string,
        data: {
            name?: string;
            username?: string;
            email?: string;
            roleId?: string;
        },
    ) {
        const user = await userRepository.findById(id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const updateData: {
            name?: string;
            username?: string;
            email?: string;
            roleId?: string;
        } = {};

        if (data.name !== undefined) {
            updateData.name = data.name.trim();
        }

        if (data.email !== undefined) {
            const email = data.email.trim().toLowerCase();

            if (email !== user.email.toLowerCase()) {
                const existing =
                    await userRepository.findByEmailIncludingDeleted(
                        email,
                    );

                if (existing && existing.id !== id) {
                    throw new ApiError(409, "Email already exists");
                }
            }

            updateData.email = email;
        }

        if (data.username !== undefined) {
            const username = this.normalizeUsername(data.username);
            this.validateUsername(username);

            const existing =
                await userRepository.findByUsernameIncludingDeleted(
                    username,
                );

            if (existing && existing.id !== id) {
                throw new ApiError(409, "Username already exists");
            }

            updateData.username = username;
        }

        if (data.roleId !== undefined) {
            const role = await userRepository.findRoleById(data.roleId);

            if (!role) {
                throw new ApiError(400, "Invalid role");
            }

            updateData.roleId = data.roleId;
        }

        return userRepository.update(id, updateData);
    }

    async resetPassword(id: string) {
        const user = await userRepository.findById(id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const hashedPassword = await hashPassword(
            DEFAULT_USER_PASSWORD,
        );

        await userRepository.updatePassword(id, hashedPassword);
    }

    async delete(id: string, currentUserId: string) {
        const user = await userRepository.findById(id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (id === currentUserId) {
            throw new ApiError(
                400,
                "You cannot delete your own account",
            );
        }

        await userRepository.softDelete(id);
    }

    async restore(id: string) {
        const user = await userRepository.findByIdIncludingDeleted(id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (!user.deletedAt) {
            throw new ApiError(400, "User is already active");
        }

        return userRepository.restore(id);
    }
}

export default new UserService();
