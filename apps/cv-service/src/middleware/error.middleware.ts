import type { Context } from "hono";

export function errorMiddleware(err: Error & { status?: number }, c: Context) {
    console.error("[cv-service error]", err.message);

    const status = err.status ?? 500;

    if (status === 401) return c.json({ error: "Unauthorized" }, 401);
    if (status === 403) return c.json({ error: "Forbidden" }, 403);
    if (status === 404) return c.json({ error: "CV not found" }, 404);
    if (status === 429) return c.json({ error: err.message }, 429);

    return c.json({ error: "Internal server error" }, 500);
}
