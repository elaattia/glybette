// Auth & user types for API responses and requests

export const AUTH_PROVIDERS = ["google", "github", "linkedin"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export interface UserDTO {
    id: string;
    email?: string;
    displayName: string;
    avatarUrl?: string;
    roles: string[];
    provider: AuthProvider;
}

export interface SelfResponse {
    user: UserDTO;
}

export interface AuthRedirectResponse {
    redirectUrl: string;
}

export interface AuthErrorResponse {
    error: { code: string; message: string };
}
