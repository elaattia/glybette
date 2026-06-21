import type { Hono } from "hono";
import { requireBetterAuthSession } from "../../auth/require-auth.js";
import { forwardToService } from "../../proxy/forward-request.js";
import type { GatewayEnv } from "../../config/env.js";
import type { ServiceRegistry } from "../../config/services.js";

export function registerCvServiceRoutes(api: Hono, ctx: { env: GatewayEnv; services: ServiceRegistry }): void {
    const { env, services } = ctx;
    const base = services.cv.baseUrl;
    const timeout = env.PROXY_TIMEOUT_MS;
    const aiTimeout = env.AI_PROXY_TIMEOUT_MS;
    const auth = requireBetterAuthSession(env, services);

    api.post("/cvs/extract", auth, (c) =>
        forwardToService(c, base, "/api/cvs/extract", { timeoutMs: aiTimeout, injectGatewayAuth: true }),
    );

    api.post("/cvs/suggest-skills", auth, (c) =>
        forwardToService(c, base, "/api/cvs/suggest-skills", { timeoutMs: aiTimeout, injectGatewayAuth: true }),
    );

    api.get("/cvs", auth, (c) =>
        forwardToService(c, base, "/api/cvs", { timeoutMs: timeout, injectGatewayAuth: true }),
    );

    api.post("/cvs", auth, (c) =>
        forwardToService(c, base, "/api/cvs", { timeoutMs: timeout, injectGatewayAuth: true }),
    );

    api.get("/cvs/:id", auth, (c) =>
        forwardToService(c, base, `/api/cvs/${c.req.param("id")}`, { timeoutMs: timeout, injectGatewayAuth: true }),
    );

    api.patch("/cvs/:id", auth, (c) =>
        forwardToService(c, base, `/api/cvs/${c.req.param("id")}`, { timeoutMs: timeout, injectGatewayAuth: true }),
    );

    api.delete("/cvs/:id", auth, (c) =>
        forwardToService(c, base, `/api/cvs/${c.req.param("id")}`, { timeoutMs: timeout, injectGatewayAuth: true }),
    );

    api.post("/cvs/:id/duplicate", auth, (c) =>
        forwardToService(c, base, `/api/cvs/${c.req.param("id")}/duplicate`, {
            timeoutMs: timeout,
            injectGatewayAuth: true,
        }),
    );

    api.post("/cvs/:id/pdf", auth, (c) =>
        forwardToService(c, base, `/api/cvs/${c.req.param("id")}/pdf`, {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );

    api.post("/cvs/:id/share", auth, (c) =>
        forwardToService(c, base, `/api/cvs/${c.req.param("id")}/share`, {
            timeoutMs: timeout,
            injectGatewayAuth: true,
        }),
    );

    api.delete("/cvs/:id/share", auth, (c) =>
        forwardToService(c, base, `/api/cvs/${c.req.param("id")}/share`, {
            timeoutMs: timeout,
            injectGatewayAuth: true,
        }),
    );

    api.post("/cvs/:id/ats-score", auth, (c) =>
        forwardToService(c, base, `/api/cvs/${c.req.param("id")}/ats-score`, {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );

    api.post("/cvs/:id/suggest-improvements", auth, (c) =>
        forwardToService(c, base, `/api/cvs/${c.req.param("id")}/suggest-improvements`, {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );

    api.post("/cvs/:id/enhance-section", auth, (c) =>
        forwardToService(c, base, `/api/cvs/${c.req.param("id")}/enhance-section`, {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );

    api.post("/cvs/:id/tailor", auth, (c) =>
        forwardToService(c, base, `/api/cvs/${c.req.param("id")}/tailor`, {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );

    api.post("/cvs/:id/cover-letter", auth, (c) =>
        forwardToService(c, base, `/api/cvs/${c.req.param("id")}/cover-letter`, {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );
}
