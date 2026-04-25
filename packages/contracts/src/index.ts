// Auth & user types for API responses and requests

export const AUTH_PROVIDERS = ["google", "github", "linkedin"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export interface UserDTO {
    id: string;
    email?: string;
    emailVerified: boolean;
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

export interface VerificationStatusResponse {
    requiresEmailVerification: boolean;
    email?: string;
}

export interface OtpRequestResponse {
    ok: true;
    expiresInSeconds: number;
    cooldownSeconds: number;
}

export interface OtpVerifyResponse {
    ok: true;
    verified: boolean;
}
