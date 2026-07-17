import bcrypt from "bcrypt";

const SALT = 10;

export const hashPassword = (password: string) =>
    bcrypt.hash(password, SALT);

export const comparePassword = (
    password: string,
    hash: string
) =>
    bcrypt.compare(password, hash);