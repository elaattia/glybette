import type { Hono } from "hono";
import { gatewayProxyRoutes } from "../config/proxy-routes.js";
import type { GatewayEnv } from "../config/env.js";
import type { ServiceRegistry } from "../config/services.js";
import { registerAdminOverviewRoute } from "./admin-overview.js";
import { registerProxyRoutes } from "./register-proxy-routes.js";

/**
 * Mount upstream proxies from {@link gatewayProxyRoutes}.
 */
export function registerServiceRoutes(api: Hono, ctx: { env: GatewayEnv; services: ServiceRegistry }): void {
    registerAdminOverviewRoute(api, ctx);
    registerProxyRoutes(api, ctx, gatewayProxyRoutes);
}
