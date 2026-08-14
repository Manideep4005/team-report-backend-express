export interface AuthPermission {
    code: string;
}

export interface AuthRole {
    id: string;
    name: string;
    permissions: AuthPermission[];
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    role: AuthRole;
}

declare global {
    namespace Express {
        interface Request {
            user: AuthUser;
        }
    }
}

export { };