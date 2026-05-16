import type { Hono } from "hono";
import type { UserController } from "../controllers/user.controller.js";

export function registerUserRoutes(app: Hono, controller: UserController): void {
    app.get("/users/me", (c) => controller.getSelf(c));
    app.put("/users/me/profile", (c) => controller.updateOwnProfile(c));
    app.get("/users/verification-state", (c) => controller.getVerificationState(c));
    app.post("/users/resolve", (c) => controller.resolveUsers(c));
}
