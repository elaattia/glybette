import type { Hono } from "hono";
import { requireBetterAuthSession } from "../../auth/require-auth.js";
import { forwardToService } from "../../proxy/forward-request.js";
import type { GatewayEnv } from "../../config/env.js";
import type { ServiceRegistry } from "../../config/services.js";

export function registerUsersServiceRoutes(
    api: Hono,
    ctx: { env: GatewayEnv; services: ServiceRegistry },
): void {
    const { env, services } = ctx;
    const baseUrl = services.users.baseUrl;
    const timeoutMs = env.PROXY_TIMEOUT_MS;

    api.get("/users/me", requireBetterAuthSession(env, services), async (c) => {
        return forwardToService(c, baseUrl, "/users/me", {
            timeoutMs,
            injectGatewayAuth: true,
        });
    });

    api.get("/users", async (c) => {
        return forwardToService(c, baseUrl, "/users", { timeoutMs });
    });

    api.get("/users/:id", async (c) => {
        const id = c.req.param("id");
        return forwardToService(c, baseUrl, `/users/${id}`, { timeoutMs });
    });

    api.on(["GET", "POST"], "/auth/*", async (c) => {
        const path = c.req.path + (new URL(c.req.url).search || "");
        return forwardToService(c, baseUrl, path, { timeoutMs });
    });
}
