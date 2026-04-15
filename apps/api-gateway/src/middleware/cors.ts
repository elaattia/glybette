import { cors } from "hono/cors";
import type { MiddlewareHandler } from "hono";
import type { GatewayEnv } from "../config/env.js";
import { resolveCorsOrigins } from "../config/env.js";

export function createCorsMiddleware(env: GatewayEnv): MiddlewareHandler {
    return cors({
        origin: resolveCorsOrigins(env),
        credentials: true,
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
    });
}
