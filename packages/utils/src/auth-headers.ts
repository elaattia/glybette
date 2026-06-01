/**
 * Standard headers set by the API gateway after JWT validation,
 * forwarded to downstream services for auth context.
 */
export const AUTH_HEADER_USER_ID = "x-user-id";
export const AUTH_HEADER_ROLES = "x-user-roles";
export const AUTH_HEADER_BASE_ROLE = "x-user-base-role";
export const AUTH_HEADER_IS_ADMIN = "x-user-is-admin";
export const AUTH_HEADER_ACCOUNT_STATUS = "x-user-account-status";

export interface AuthContext {
    userId: string;
    baseRole: string;
    isAdmin: boolean;
    accountStatus: string;
    roles: string[];
}

/**
 * Read auth context from request headers (set by gateway).
 * Roles header is comma-separated.
 */
export function getUserFromHeaders(headers: Headers): AuthContext | null {
    const userId = headers.get(AUTH_HEADER_USER_ID);
    if (!userId) return null;
    const baseRole = headers.get(AUTH_HEADER_BASE_ROLE)?.trim() || "student";
    const isAdminHeader = headers.get(AUTH_HEADER_IS_ADMIN)?.toLowerCase() || "";
    const isAdmin = isAdminHeader === "1" || isAdminHeader === "true";
    const accountStatus = headers.get(AUTH_HEADER_ACCOUNT_STATUS)?.trim() || "active";
    const rolesHeader = headers.get(AUTH_HEADER_ROLES);
    const explicitRoles = rolesHeader
        ? rolesHeader
              .split(",")
              .map((r) => r.trim())
              .filter(Boolean)
        : [];
    const inferredRoles = isAdmin ? [baseRole, "admin"] : [baseRole];
    const roles = [...new Set((explicitRoles.length > 0 ? explicitRoles : inferredRoles).filter(Boolean))];
    return { userId, baseRole, isAdmin, accountStatus, roles };
}
