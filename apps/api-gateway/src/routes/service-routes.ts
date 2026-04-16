import type { Hono } from "hono";
import type { GatewayEnv } from "../config/env.js";
import type { ServiceRegistry } from "../config/services.js";
import { registerUsersServiceRoutes } from "./services/users.routes.js";
import { registerScrapingServiceRoutes } from "./services/scraping.routes.js";


/**
 * Mount all upstream microservice proxies. Add new services here.
 */
export function registerServiceRoutes(
    api: Hono,
    ctx: { env: GatewayEnv; services: ServiceRegistry },
): void {
    registerUsersServiceRoutes(api, ctx);
    registerScrapingServiceRoutes(api, ctx);

}
