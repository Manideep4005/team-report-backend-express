import userRepository from "../repositories/user.repository";

import { ApiError } from "../utils/ApiError";

import { hashPassword } from "../utils/password";


/*
 * ================================================================
 * DEFAULT PASSWORD
 * ================================================================
 *
 * This password is assigned when:
 *
 * 1. A new user is created.
 * 2. An administrator resets a user's password.
 *
 * The password is NEVER stored as plain text.
 * It is always hashed before reaching the database.
 */

const DEFAULT_USER_PASSWORD =
    "test123";


class UserService {


    /* ============================================================
       GET ALL
    ============================================================ */

    async getAll() {

        return userRepository.findAll();

    }


    /* ============================================================
       GET BY ID
    ============================================================ */

    async getById(
        id: string
    ) {

        const user =
            await userRepository.findByIdWithRole(
                id
            );


        if (!user) {

            throw new ApiError(
                404,
                "User not found"
            );

        }


        return user;
    }


    /* ============================================================
       CREATE
    ============================================================ */

    async create(
        name: string,
        email: string,
        roleId: string,
        currentUserRole: string
    ) {

        const existing =
            await userRepository.findByEmail(
                email
            );


        if (existing) {

            throw new ApiError(
                409,
                "Email already exists"
            );

        }


        const role =
            await userRepository.findRoleById(
                roleId
            );


        if (!role) {

            throw new ApiError(
                400,
                "Invalid role"
            );

        }


        /*
         * Only SUPER_ADMIN can assign
         * SUPER_ADMIN role.
         */

        if (
            role.name === "SUPER_ADMIN" &&
            currentUserRole !== "SUPER_ADMIN"
        ) {

            throw new ApiError(
                403,
                "Only SUPER_ADMIN can assign SUPER_ADMIN role"
            );

        }


        /*
         * Automatically assign default password.
         */

        const hashedPassword =
            await hashPassword(
                DEFAULT_USER_PASSWORD
            );


        return userRepository.create({

            name,

            email,

            password:
                hashedPassword,

            roleId,

        });

    }


    /* ============================================================
       UPDATE
    ============================================================ */

    async update(
        id: string,
        data: {
            name?: string;
            email?: string;
            roleId?: string;
        }
    ) {

        const user =
            await userRepository.findById(
                id
            );


        if (!user) {

            throw new ApiError(
                404,
                "User not found"
            );

        }


        /*
         * Check duplicate email.
         */

        if (
            data.email &&
            data.email !== user.email
        ) {

            const existing =
                await userRepository.findByEmail(
                    data.email
                );


            if (existing) {

                throw new ApiError(
                    409,
                    "Email already exists"
                );

            }

        }


        /*
         * Validate role.
         */

        if (data.roleId) {

            const role =
                await userRepository.findRoleById(
                    data.roleId
                );


            if (!role) {

                throw new ApiError(
                    400,
                    "Invalid role"
                );

            }

        }


        return userRepository.update(
            id,
            data
        );

    }


    /* ============================================================
       RESET PASSWORD
    ============================================================ */

    async resetPassword(
        id: string
    ) {

        const user =
            await userRepository.findById(
                id
            );


        if (!user) {

            throw new ApiError(
                404,
                "User not found"
            );

        }


        const hashedPassword =
            await hashPassword(
                DEFAULT_USER_PASSWORD
            );


        await userRepository.updatePassword(
            id,
            hashedPassword
        );

    }



    async delete(
        id: string,
        currentUserId: string
    ) {

        const user =
            await userRepository.findById(
                id
            );


        if (!user) {

            throw new ApiError(
                404,
                "User not found"
            );

        }


        if (
            id === currentUserId
        ) {

            throw new ApiError(
                400,
                "You cannot delete your own account"
            );

        }


        await userRepository.delete(
            id
        );

    }

}


export default new UserService();