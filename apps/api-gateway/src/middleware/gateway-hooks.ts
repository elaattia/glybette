import { createMiddleware } from "hono/factory";
import { getGatewayHooks } from "../platform/hooks.js";

/** Phase-two hooks (metrics, tracing) — access logs use morgan in `index.ts`. */
export const gatewayHooksMiddleware = createMiddleware(async (c, next) => {
    const requestId = c.get("requestId");
    const method = c.req.method;
    const url = c.req.url;
    const { onRequest, onResponse } = getGatewayHooks();
    onRequest?.({ requestId, method, url });
    const start = Date.now();
    await next();
    const durationMs = Date.now() - start;
    const status = c.res.status;
    onResponse?.({ requestId, method, url, status, durationMs });
});
