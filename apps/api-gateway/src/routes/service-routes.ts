import type { Hono } from "hono";
import { gatewayProxyRoutes } from "../config/proxy-routes.js";
import type { GatewayEnv } from "../config/env.js";
import type { ServiceRegistry } from "../config/services.js";
import { registerProxyRoutes } from "./register-proxy-routes.js";

/**
 * Mount upstream proxies from {@link gatewayProxyRoutes}.
 */
export function registerServiceRoutes(
    api: Hono,
    ctx: { env: GatewayEnv; services: ServiceRegistry },
): void {
    registerProxyRoutes(api, ctx, gatewayProxyRoutes);
}
