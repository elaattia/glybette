import { Hono } from "hono";
import { logger } from "hono/logger";
import type { GatewayEnv } from "./config/env.js";
import { buildServiceRegistry } from "./config/services.js";
import { createCorsMiddleware } from "./middleware/cors.js";
import { requestContextMiddleware } from "./middleware/request-context.js";
import { gatewayHooksMiddleware } from "./middleware/gateway-hooks.js";
import { gatewayErrorHandler } from "./middleware/error-handler.js";
import { registerServiceRoutes } from "./routes/service-routes.js";

export function createApp(env: GatewayEnv): Hono {
    const services = buildServiceRegistry(env);
    const app = new Hono();

    app.onError(gatewayErrorHandler);
    app.use("*", logger());
    app.use("*", requestContextMiddleware);
    app.use("*", gatewayHooksMiddleware);
    app.use("*", createCorsMiddleware(env));

    const api = new Hono().basePath("/api");
    api.use("*", async (c, next) => {
        c.set("gatewayEnv", env);
        c.set("services", services);
        await next();
    });

    api.get("/health", (c) => c.json({ status: "ok", name: "api-gateway" }, 200));
    registerServiceRoutes(api, { env, services });


    app.route("/", api);
    return app;
}

