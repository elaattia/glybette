import { createMiddleware } from "hono/factory";

export const requestContextMiddleware = createMiddleware(async (c, next) => {
    const requestId = crypto.randomUUID().slice(0, 8);
    c.set("requestId", requestId);
    await next();
});
