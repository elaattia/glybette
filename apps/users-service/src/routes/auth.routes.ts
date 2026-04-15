import type { Hono } from "hono";
import type { AuthController } from "../controllers/auth.controller.js";

export function registerAuthRoutes(app: Hono, controller: AuthController): void {
    app.on(["GET", "POST"], "/api/auth/*", (c) => controller.handleBetterAuth(c));
}
