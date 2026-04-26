import { createMiddleware } from "hono/factory";
import { AUTH_HEADER_ROLES, AUTH_HEADER_USER_ID, sanitizeProxyHeaders, ServiceUnavailableError } from "@glybette/utils";
import type { GatewayEnv } from "../config/env.js";
import type { ServiceRegistry } from "../config/services.js";

export type GatewayAuthPayload = {
    userId: string;
    roles: string[];
    requiresEmailVerification: boolean;
};

export function requireBetterAuthSession(env: GatewayEnv, services: ServiceRegistry) {
    return createMiddleware(async (c, next) => {
        const auth = await fetchGatewayAuthFromSession(env, services, c.req.raw.headers);
        if (!auth) {
            return c.json(
                {
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Authentication required",
                    },
                },
                401,
            );
        }
        if (auth.requiresEmailVerification && !isVerificationAllowlisted(new URL(c.req.url).pathname)) {
            return c.json(
                {
                    error: {
                        code: "EMAIL_VERIFICATION_REQUIRED",
                        message: "Email verification is required before accessing this resource",
                    },
                },
                403,
            );
        }
        c.set("gatewayAuth", auth);
        await next();
    });
}

const VERIFICATION_ALLOWLIST = ["/api/auth/otp", "/api/auth/verification-status", "/api/portfolio/public"];

function isVerificationAllowlisted(pathname: string): boolean {
    return VERIFICATION_ALLOWLIST.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function fetchVerificationState(
    env: GatewayEnv,
    services: ServiceRegistry,
    requestHeaders: Headers,
    userId: string,
    roles: string[],
): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.PROXY_TIMEOUT_MS);
    const headers = sanitizeProxyHeaders(requestHeaders);
    headers.set(AUTH_HEADER_USER_ID, userId);
    headers.set(AUTH_HEADER_ROLES, roles.join(","));

    try {
        const response = await fetch(`${services.users.baseUrl.replace(/\/$/, "")}/users/verification-state`, {
            method: "GET",
            headers,
            signal: controller.signal,
        });

        if (response.status === 404) {
            return false;
        }

        if (!response.ok) {
            throw new ServiceUnavailableError("Unable to resolve verification state");
        }

        const payload = (await response.json()) as { requiresEmailVerification?: boolean } | null;
        return Boolean(payload?.requiresEmailVerification);
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Resolves Better Auth session via users-service; returns null when anonymous or no user in payload.
 */
export async function fetchGatewayAuthFromSession(
    env: GatewayEnv,
    services: ServiceRegistry,
    requestHeaders: Headers,
): Promise<GatewayAuthPayload | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.PROXY_TIMEOUT_MS);
    const headers = sanitizeProxyHeaders(requestHeaders);

    try {
        const response = await fetch(`${services.users.baseUrl.replace(/\/$/, "")}/api/auth/get-session`, {
            method: "GET",
            headers,
            signal: controller.signal,
        });

        if (response.status === 401) {
            return null;
        }

        if (!response.ok) {
            throw new ServiceUnavailableError("Unable to resolve auth context");
        }

        const raw: unknown = await response.json();
        const payload =
            raw !== null && typeof raw === "object"
                ? (raw as {
                      user?: { id?: string; role?: string | string[] };
                      session?: unknown;
                  })
                : null;
        if (!payload?.user?.id) {
            return null;
        }

        const roles = Array.isArray(payload.user.role)
            ? payload.user.role
            : typeof payload.user.role === "string"
              ? [payload.user.role]
              : [];
        const requiresEmailVerification = await fetchVerificationState(
            env,
            services,
            requestHeaders,
            payload.user.id,
            roles,
        );

        return {
            userId: payload.user.id,
            roles,
            requiresEmailVerification,
        };
    } catch (error) {
        if (error instanceof ServiceUnavailableError) {
            throw error;
        }
        throw new ServiceUnavailableError("Auth service unavailable");
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Best-effort session resolution for downstream proxy injection. Never rejects for missing session.
 * Skips OPTIONS so CORS preflights do not call get-session.
 */
export function tryResolveBetterAuthSession(env: GatewayEnv, services: ServiceRegistry) {
    return createMiddleware(async (c, next) => {
        if (c.req.method === "OPTIONS") {
            await next();
            return;
        }

        const auth = await fetchGatewayAuthFromSession(env, services, c.req.raw.headers);
        if (auth) {
            if (auth.requiresEmailVerification && !isVerificationAllowlisted(new URL(c.req.url).pathname)) {
                return c.json(
                    {
                        error: {
                            code: "EMAIL_VERIFICATION_REQUIRED",
                            message: "Email verification is required before accessing this resource",
                        },
                    },
                    403,
                );
            }
            c.set("gatewayAuth", auth);
        }
        await next();
    });
}
