import { Hono } from "hono";
import type { Context } from "hono";
import { tryResolveBetterAuthSession } from "../auth/require-auth.js";
import type { GatewayProxyRoute } from "../config/proxy-routes.js";
import type { GatewayEnv } from "../config/env.js";
import type { ServiceRegistry } from "../config/services.js";
import { forwardToService } from "../proxy/forward-request.js";

function defaultPublicPrefix(mount: string): string {
    const base = mount.replace(/\/$/, "") || "/";
    return `/api${base}`;
}

function buildUpstreamPath(route: GatewayProxyRoute, c: Context): string {
    const url = new URL(c.req.url);
    const search = url.search || "";
    if (route.upstream.kind === "requestPath") {
        return url.pathname + search;
    }
    const publicPrefix = route.upstream.publicPrefix ?? defaultPublicPrefix(route.mount);
    const { upstreamPrefix } = route.upstream;
    const pathname = url.pathname;
    const rest =
        pathname.startsWith(publicPrefix) && pathname.length > publicPrefix.length
            ? pathname.slice(publicPrefix.length)
            : "";
    const base = upstreamPrefix.replace(/\/$/, "");
    return `${base}${rest}${search}`;
}

export function registerProxyRoutes(
    api: Hono,
    ctx: { env: GatewayEnv; services: ServiceRegistry },
    routes: readonly GatewayProxyRoute[],
): void {
    const { env, services } = ctx;
    const timeoutMs = env.PROXY_TIMEOUT_MS;

    for (const route of routes) {
        const baseUrl = services[route.service].baseUrl;
        const forward = async (c: Context) => {
            const pathWithQuery = buildUpstreamPath(route, c);
            return forwardToService(c, baseUrl, pathWithQuery, {
                timeoutMs,
                injectGatewayAuth: route.injectGatewayAuth,
            });
        };

        const mount = route.mount.replace(/\/$/, "") || "/";

        if (route.methods === "all") {
            const sub = new Hono();
            if (route.session === "optional") {
                sub.use("*", tryResolveBetterAuthSession(env, services));
            }
            sub.all("*", forward);
            api.route(mount, sub);
        } else {
            const sub = new Hono();
            if (route.session === "optional") {
                sub.use("*", tryResolveBetterAuthSession(env, services));
            }
            sub.on([...route.methods], "/", forward);
            sub.on([...route.methods], "/*", forward);
            api.route(mount, sub);
        }
    }
}
