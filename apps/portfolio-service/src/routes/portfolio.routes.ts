import type { Hono } from "hono";
import type { PortfolioController } from "../controllers/portfolio.controller.js";

export function registerPortfolioRoutes(app: Hono, controller: PortfolioController): void {
    app.get("/portfolio/admin/overview-stats", (c) => controller.adminOverviewStats(c));
    app.get("/portfolio/admin/list", (c) => controller.adminList(c));
    app.get("/portfolio/admin/:id", (c) => controller.adminGet(c));
    app.delete("/portfolio/admin/:id", (c) => controller.adminDelete(c));

    app.get("/portfolio/me", (c) => controller.getCurrent(c));
    app.post("/portfolio/slug/check", (c) => controller.checkSlug(c));
    app.put("/portfolio/me/slug", (c) => controller.setSlug(c));
    app.put("/portfolio/me", (c) => controller.saveCurrent(c));
    app.get("/portfolio/public/resolve", (c) => controller.resolvePublic(c));
    app.get("/portfolio/public/:slug", (c) => controller.getPublicBySlug(c));
}
