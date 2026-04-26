/**
 * Standard headers set by the API gateway after JWT validation,
 * forwarded to downstream services for auth context.
 */
export const AUTH_HEADER_USER_ID = "x-user-id";
export const AUTH_HEADER_ROLES = "x-user-roles";

export interface AuthContext {
    userId: string;
    roles: string[];
}

/**
 * Read auth context from request headers (set by gateway).
 * Roles header is comma-separated.
 */
export function getUserFromHeaders(headers: Headers): AuthContext | null {
    const userId = headers.get(AUTH_HEADER_USER_ID);
    if (!userId) return null;
    const rolesHeader = headers.get(AUTH_HEADER_ROLES);
    const roles = rolesHeader
        ? rolesHeader
              .split(",")
              .map((r) => r.trim())
              .filter(Boolean)
        : [];
    return { userId, roles };
}
