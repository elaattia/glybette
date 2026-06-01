import type { Context } from "hono";
import type { PortfolioSlugRequest } from "@glybette/contracts";
import { getUserFromHeaders, UnauthorizedError, BadRequestError } from "@glybette/utils";
import type { PortfolioService } from "../services/portfolio.service.js";
import {
    extractSlugFromHost,
    validateSavePortfolioRequest,
    validatePortfolioSlug,
} from "../services/portfolio.validation.js";

export class PortfolioController {
    constructor(
        private portfolioService: PortfolioService,
        private rootDomain: string,
    ) {}

    async getCurrent(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const response = await this.portfolioService.getCurrent(auth.userId);
        return c.json(response, 200);
    }

    async checkSlug(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const body = (await c.req.json().catch(() => null)) as PortfolioSlugRequest | null;
        const slug = validatePortfolioSlug(String(body?.slug ?? ""));
        const response = await this.portfolioService.checkSlugAvailability(slug, auth.userId);
        return c.json(response, 200);
    }

    async setSlug(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const body = (await c.req.json().catch(() => null)) as PortfolioSlugRequest | null;
        const response = await this.portfolioService.setSlug(auth.userId, String(body?.slug ?? ""));
        return c.json(response, 200);
    }

    async saveCurrent(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const payload = validateSavePortfolioRequest(await c.req.json().catch(() => null));
        const response = await this.portfolioService.saveCurrent(auth.userId, payload);
        return c.json(response, 200);
    }

    async getPublicBySlug(c: Context): Promise<Response> {
        const response = await this.portfolioService.getPublicBySlug(c.req.param("slug"));
        return c.json(response, 200);
    }

    async resolvePublic(c: Context): Promise<Response> {
        const explicitSlug = c.req.query("slug");
        const forwardedHost = c.req.header("x-forwarded-host");
        const host = explicitSlug ? undefined : (forwardedHost ?? c.req.header("host") ?? undefined);
        const slug = explicitSlug ? validatePortfolioSlug(explicitSlug) : extractSlugFromHost(host, this.rootDomain);

        if (!slug) {
            throw new BadRequestError("A portfolio slug or portfolio subdomain host is required.");
        }

        const response = await this.portfolioService.getPublicBySlug(slug);
        return c.json(response, 200);
    }

    async adminOverviewStats(c: Context): Promise<Response> {
        this.requireAdmin(c);
        return c.json(await this.portfolioService.getAdminOverviewStats(), 200);
    }

    async adminList(c: Context): Promise<Response> {
        this.requireAdmin(c);
        const limit = Number(c.req.query("limit") ?? "100");
        const portfolios = await this.portfolioService.adminList(Number.isFinite(limit) ? limit : 100);
        return c.json({ portfolios }, 200);
    }

    async adminGet(c: Context): Promise<Response> {
        this.requireAdmin(c);
        const portfolio = await this.portfolioService.adminGetById(c.req.param("id"));
        return c.json({ portfolio }, 200);
    }

    async adminDelete(c: Context): Promise<Response> {
        this.requireAdmin(c);
        const response = await this.portfolioService.adminDeleteById(c.req.param("id"));
        return c.json(response, 200);
    }

    private requireAuth(c: Context) {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth) {
            throw new UnauthorizedError("Missing auth context");
        }
        return auth;
    }

    private requireAdmin(c: Context) {
        const auth = this.requireAuth(c);
        if (!auth.isAdmin && !auth.roles.includes("admin")) {
            throw new UnauthorizedError("Admin role required");
        }
        return auth;
    }
}
