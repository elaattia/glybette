import type { Hono } from "hono";
import { requireBetterAuthSession } from "../../auth/require-auth.js";
import { forwardToService } from "../../proxy/forward-request.js";
import type { GatewayEnv } from "../../config/env.js";
import type { ServiceRegistry } from "../../config/services.js";
 
export function registerJobsServiceRoutes(
    api: Hono,
    ctx: { env: GatewayEnv; services: ServiceRegistry },
): void {
    const { env, services } = ctx;
    const base      = services.jobs.baseUrl;
    const timeout   = env.PROXY_TIMEOUT_MS;
    const aiTimeout = env.AI_PROXY_TIMEOUT_MS;
    const auth      = requireBetterAuthSession(env, services);
 
 
    api.get("/jobs/offres", (c) =>
        forwardToService(c, base, "/api/offres", { timeoutMs: timeout, injectGatewayAuth: false }),
    );
 
    api.get("/jobs/offres/:id", (c) =>
        forwardToService(c, base, `/api/offres/${c.req.param("id")}`, {
            timeoutMs: timeout,
            injectGatewayAuth: false,
        }),
    );
 
    api.get("/jobs/stats", (c) =>
        forwardToService(c, base, "/api/stats", { timeoutMs: timeout, injectGatewayAuth: false }),
    );
 
    api.post("/jobs/offres/:id/click", (c) =>
        forwardToService(c, base, `/api/offres/${c.req.param("id")}/click`, {
            timeoutMs: timeout,
            injectGatewayAuth: false,
        }),
    );
 
 
    api.get("/jobs/matching/offre/:id", auth, (c) =>
        forwardToService(c, base, `/api/matching/offre/${c.req.param("id")}`, {
            timeoutMs: timeout,
            injectGatewayAuth: true,
        }),
    );

    api.post("/jobs/matching/offre/:id", auth, (c) =>
        forwardToService(c, base, `/api/matching/offre/${c.req.param("id")}`, {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );
 
    api.post("/jobs/matching/top", auth, (c) =>
        forwardToService(c, base, "/api/matching/top", {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );
 
    api.post("/jobs/matching/cv-improvements", auth, (c) =>
        forwardToService(c, base, "/api/matching/cv-improvements", {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );
 
    api.post("/jobs/interview/questions/:offreId", auth, (c) =>
        forwardToService(c, base, `/api/interview/questions/${c.req.param("offreId")}`, {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );
 
    api.post("/jobs/interview/evaluate", auth, (c) =>
        forwardToService(c, base, "/api/interview/evaluate", {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );
 
    api.post("/jobs/interview/plan/:offreId", auth, (c) =>
        forwardToService(c, base, `/api/interview/plan/${c.req.param("offreId")}`, {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );
 
    api.post("/jobs/cover-letter/generate", auth, (c) =>
        forwardToService(c, base, "/api/cover-letter/generate", {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );
 
    api.post("/jobs/cover-letter/refine", auth, (c) =>
        forwardToService(c, base, "/api/cover-letter/refine", {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );

    api.post("/jobs/chat", auth, (c) =>
        forwardToService(c, base, "/api/chat", {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );
 
    api.post("/jobs/cv-tailored-sections", auth, (c) =>
        forwardToService(c, base, "/api/cv-tailored-sections", {
            timeoutMs: aiTimeout,
            injectGatewayAuth: true,
        }),
    );
}