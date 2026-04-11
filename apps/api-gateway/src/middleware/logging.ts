import { createMiddleware } from "hono/factory";
import { getGatewayHooks } from "../platform/hooks.js";

export const loggingMiddleware = createMiddleware(async (c, next) => {
    const requestId = c.get("requestId");
    const method = c.req.method;
    const url = c.req.url;
    const { onRequest, onResponse } = getGatewayHooks();
    onRequest?.({ requestId, method, url });
    const start = Date.now();
    console.log(`[${requestId}] ${method} ${url}`);
    await next();
    const durationMs = Date.now() - start;
    const status = c.res.status;
    console.log(`[${requestId}] ${method} ${url} ${status} ${durationMs}ms`);
    onResponse?.({ requestId, method, url, status, durationMs });
});
