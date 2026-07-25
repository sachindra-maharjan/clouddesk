export type AuthRole = 'ADMIN' | 'MEMBER';

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    displayName: string;
    role: AuthRole;
}