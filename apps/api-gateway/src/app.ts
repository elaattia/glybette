import { Hono } from "hono";
import type { GatewayEnv } from "./config/env.js";
import { buildServiceRegistry } from "./config/services.js";
import { createCorsMiddleware } from "./middleware/cors.js";
import { requestContextMiddleware } from "./middleware/request-context.js";
import { loggingMiddleware } from "./middleware/logging.js";
import { gatewayErrorHandler } from "./middleware/error-handler.js";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { registerServiceRoutes } from "./routes/service-routes.js";

export function createApp(env: GatewayEnv): Hono {
    const services = buildServiceRegistry(env);
    const app = new Hono();

    app.onError(gatewayErrorHandler);
    app.use("*", requestContextMiddleware);
    app.use("*", loggingMiddleware);
    app.use("*", createCorsMiddleware(env));

    const api = new Hono().basePath("/api");
    api.use("*", async (c, next) => {
        c.set("gatewayEnv", env);
        c.set("services", services);
        await next();
    });

    registerHealthRoutes(api);
    registerServiceRoutes(api, { env, services });


    app.route("/", api);
    return app;
}

