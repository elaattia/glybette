import type { Context } from "hono";

export function errorMiddleware(err: Error & { status?: number }, c: Context) {
    console.error("[jobs-service error]", err.message, err.stack);

    const status = err.status ?? 500;

    if (status === 400) return c.json({ error: "Bad Request", details: err.message }, 400);
    if (status === 401) return c.json({ error: "Unauthorized" }, 401);
    if (status === 403) return c.json({ error: "Forbidden" }, 403);
    if (status === 404) return c.json({ error: "Not Found", details: err.message }, 404);
    if (status === 429) return c.json({ error: "Too Many Requests", details: err.message }, 429);

    return c.json({ error: "Internal server error" }, 500);
}
