import type { Context, Next } from "hono";
import { loadEnv } from "../config/env.js";

const env = loadEnv();

export async function authMiddleware(c: Context, next: Next) {
    const userId = c.req.header("x-user-id");
    const secret = c.req.header("x-internal-secret") ?? c.req.header("x-inter-secret");

    const expected = env.INTERNAL_SERVICE_SECRET;

    if (!userId || secret !== expected) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("[jobs-service authMiddleware] Unauthorized:", {
                hasUserId: !!userId,
                secretMatch: secret === expected,
            });
        }
        return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("userId", userId);
    await next();
}
