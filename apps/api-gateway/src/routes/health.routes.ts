import type { Hono } from "hono";

export function registerHealthRoutes(api: Hono): void {
    api.get("/health", (c) => c.json({ status: "ok", name: "api-gateway" }, 200));
}
