import type { Context, Next } from "hono";

export async function internalAuthMiddleware(c: Context, next: Next) {
    const secret = c.req.header("x-internal-secret");
    if (!process.env.INTERNAL_SERVICE_SECRET || secret !== process.env.INTERNAL_SERVICE_SECRET) {
        return c.json({ error: "Forbidden" }, 403);
    }
    await next();
}