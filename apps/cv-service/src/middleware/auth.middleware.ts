import type { Context, Next } from "hono";

export async function authMiddleware(c: Context, next: Next) {
    const userId = c.req.header("x-user-id");

    const secret = c.req.header("x-internal-secret") ?? c.req.header("x-inter-secret");

    const expected = process.env.INTERNAL_SERVICE_SECRET ?? "dev-secret-ela";

    if (!userId || secret !== expected) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("[authMiddleware] Unauthorized:", {
                hasUserId: !!userId,
                secretMatch: secret === expected,
                receivedSecret: secret?.slice(0, 6) + "…",
            });
        }
        return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("userId", userId);
    await next();
}
