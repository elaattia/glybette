import { Hono } from "hono";
import type { GatewayEnv } from "../../config/env.js";
import type { ServiceRegistry } from "../../config/services.js";
import { forwardToService } from "../../proxy/forward-request.js";

export function registerScrapingServiceRoutes(
    api: Hono,
    ctx: { env: GatewayEnv; services: ServiceRegistry },
): void {
    const scraping = new Hono().basePath("/scraping");
    const { env, services } = ctx;

    const baseUrl = services.scraping.baseUrl;
    const timeoutMs = env.PROXY_TIMEOUT_MS;

    scraping.get("/offres", async (c) => {
        const url = new URL(`${baseUrl}/offres`);

        const query = c.req.query();
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null && value !== "") {
                url.searchParams.set(key, value);
            }
        }

        return forwardToService(c, baseUrl, url.pathname + url.search, {
            timeoutMs,
        });
    });

    scraping.get("/offres/:id", async (c) => {
        const id = c.req.param("id");
        return forwardToService(c, baseUrl, `/offres/${id}`, {
            timeoutMs,
        });
    });

    scraping.get("/stats", async (c) => {
        return forwardToService(c, baseUrl, "/stats", {
            timeoutMs,
        });
    });

    scraping.get("/sources", async (c) => {
        return forwardToService(c, baseUrl, "/sources", {
            timeoutMs,
        });
    });

    scraping.post("/trigger", async (c) => {
        let source = "all";

        try {
            const body = await c.req.json<{ source: string }>();
            source = body?.source ?? "all";
        } catch {}

        const upstream = new URL(`${baseUrl}/scrape/now`);
        upstream.searchParams.set("source", source);

        const res = await fetch(upstream.toString(), {
            method: "POST",
            signal: AbortSignal.timeout(timeoutMs),
        });

        return new Response(res.body, {
            status: res.status,
            headers: new Headers(res.headers),
        });
    });

    scraping.get("/health", async (c) => {
        return forwardToService(c, baseUrl, "/health", {
            timeoutMs,
        });
    });
    api.route("/", scraping);
}