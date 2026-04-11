import { createMiddleware } from "hono/factory";
import {
    sanitizeProxyHeaders,
    UnauthorizedError,
    ServiceUnavailableError,
} from "@glybette/utils";
import type { GatewayEnv } from "../config/env.js";
import type { ServiceRegistry } from "../config/services.js";

/**
 * Validates the Better Auth browser session and sets `gatewayAuth`
 * for downstream proxy injection.
 */
export function requireBetterAuthSession(env: GatewayEnv, services: ServiceRegistry) {
    return createMiddleware(async (c, next) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), env.PROXY_TIMEOUT_MS);
        const headers = sanitizeProxyHeaders(c.req.raw.headers);

        try {
            const response = await fetch(`${services.users.baseUrl.replace(/\/$/, "")}/api/auth/get-session`, {
                method: "GET",
                headers,
                signal: controller.signal,
            });

            if (response.status === 401) {
                throw new UnauthorizedError("Not signed in");
            }

            if (!response.ok) {
                throw new ServiceUnavailableError("Unable to resolve auth context");
            }

            const payload = await response.json() as {
                user?: { id?: string; role?: string | string[] };
                session?: unknown;
            };
            if (!payload.user?.id) {
                throw new UnauthorizedError("Missing auth context");
            }

            const roles = Array.isArray(payload.user.role)
                ? payload.user.role
                : typeof payload.user.role === "string"
                    ? [payload.user.role]
                    : [];

            c.set("gatewayAuth", {
                userId: payload.user.id,
                roles,
            });
            await next();
        } catch (error) {
            if (error instanceof UnauthorizedError || error instanceof ServiceUnavailableError) {
                throw error;
            }

            throw new ServiceUnavailableError("Auth service unavailable");
        } finally {
            clearTimeout(timeout);
        }
    });
}
