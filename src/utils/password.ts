import bcrypt from "bcrypt";

const SALT = 10;

export const hashPassword = (password: string) =>
    bcrypt.hash(password, SALT);

export async function comparePassword(
    password: string,
    hashedPassword: string
) {
    return bcrypt.compare(
        password,
        hashedPassword
    );
}