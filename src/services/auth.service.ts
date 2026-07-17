import { ApiError } from "../utils/ApiError";
import { comparePassword, hashPassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import userRepository from "../repositories/user.repository";

class AuthService {

    async register(
        name: string,
        email: string,
        password: string
    ) {

        const existing = await userRepository.findByEmail(email);

        if (existing) {
            throw new ApiError(409, "Email already exists");
        }

        const hashed = await hashPassword(password);

        const user = await userRepository.create({
            name,
            email,
            password: hashed,
        });

        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        return {
            user,
            token,
        };
    }

    async login(email: string, password: string) {

        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new ApiError(401, "Invalid credentials");
        }

        const matched = await comparePassword(
            password,
            user.password
        );

        if (!matched) {
            throw new ApiError(401, "Invalid credentials");
        }

        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        const mappedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
        };

        return {
            user: mappedUser,
            token,
        };
    }
}

export default new AuthService();