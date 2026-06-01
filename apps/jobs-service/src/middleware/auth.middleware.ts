import type { Context, Next } from "hono";
import { loadEnv } from "../config/env.js";

const env = loadEnv();

export async function authMiddleware(c: Context, next: Next) {
    const userId = c.req.header("x-user-id");
    const rolesHeader = c.req.header("x-user-roles") ?? "";
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
    const roles = rolesHeader
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean);
    c.set("roles", roles);
    c.set("isAdmin", roles.includes("admin") || c.req.header("x-user-is-admin") === "true");
    await next();
}
