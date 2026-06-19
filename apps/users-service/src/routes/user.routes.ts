import type { Hono } from "hono";
import type { UserController } from "../controllers/user.controller.js";

export function registerUserRoutes(app: Hono, controller: UserController): void {
    app.get("/users/me", (c) => controller.getSelf(c));
    app.get("/users/me/profile", (c) => controller.getOwnProfile(c));
    app.put("/users/me/profile", (c) => controller.updateOwnProfile(c));
    app.put("/users/me/onboarding", (c) => controller.completeOnboarding(c));
    app.put("/users/me/account", (c) => controller.updateOwnAccount(c));
    app.get("/users/verification-state", (c) => controller.getVerificationState(c));
    app.post("/users/resolve", (c) => controller.resolveUsers(c));
    app.get("/users/admin/overview-stats", (c) => controller.getAdminOverviewStats(c));
    app.get("/users/admin/accounts", (c) => controller.listAccounts(c));
    app.patch("/users/admin/accounts/:id/status", (c) => controller.setAccountStatus(c));
    app.patch("/users/admin/accounts/:id/verification", (c) => controller.setVerification(c));
    app.patch("/users/admin/accounts/:id/base-role", (c) => controller.setBaseRole(c));
    app.patch("/users/admin/accounts/:id/admin", (c) => controller.setAdminElevation(c));
    app.delete("/users/admin/accounts/:id", (c) => controller.deleteAccount(c));
}
