import type { Hono } from "hono";
import type { PortfolioController } from "../controllers/portfolio.controller.js";

export function registerPortfolioRoutes(app: Hono, controller: PortfolioController): void {
    app.get("/portfolio/me", (c) => controller.getCurrent(c));
    app.post("/portfolio/slug/check", (c) => controller.checkSlug(c));
    app.put("/portfolio/me/slug", (c) => controller.setSlug(c));
    app.put("/portfolio/me", (c) => controller.saveCurrent(c));
    app.get("/portfolio/public/resolve", (c) => controller.resolvePublic(c));
    app.get("/portfolio/public/:slug", (c) => controller.getPublicBySlug(c));
}
