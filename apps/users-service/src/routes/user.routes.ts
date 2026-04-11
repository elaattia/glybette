import type { Hono } from "hono";
import type { UserController } from "../controllers/user.controller.js";

export function registerUserRoutes(app: Hono, controller: UserController): void {
    app.get("/users/me", (c) => controller.getSelf(c));
}
