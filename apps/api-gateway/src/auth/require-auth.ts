import { createMiddleware } from "hono/factory";
import { sanitizeProxyHeaders, ServiceUnavailableError } from "@glybette/utils";
import type { GatewayEnv } from "../config/env.js";
import type { ServiceRegistry } from "../config/services.js";

export type GatewayAuthPayload = { userId: string; roles: string[] };

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

        return {
            userId: payload.user.id,
            roles,
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
            c.set("gatewayAuth", auth);
        }
        await next();
    });
}
