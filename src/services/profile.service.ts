import profileRepository from "../repositories/profile.repository";
import { ApiError } from "../utils/ApiError";
import { comparePassword, hashPassword } from "../utils/password";

class ProfileService {
    async getProfile(userId: string) {
        const user = await profileRepository.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const { password, ...profile } = user;

        return profile;
    }

    async updateProfile(userId: string, name: string) {
        return profileRepository.updateProfile(userId, name);
    }

    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ) {
        const user = await profileRepository.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const validPassword = await comparePassword(
            currentPassword,
            user.password
        );

        if (!validPassword) {
            throw new ApiError(400, "Current password is incorrect");
        }

        const samePassword = await comparePassword(
            newPassword,
            user.password
        );

        if (samePassword) {
            throw new ApiError(
                400,
                "New password cannot be the same as the current password"
            );
        }

        const hashedPassword = await hashPassword(newPassword);

        await profileRepository.updatePassword(
            userId,
            hashedPassword
        );
    }
}

export default new ProfileService();