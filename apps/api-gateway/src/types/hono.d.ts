import type { GatewayEnv } from "../config/env.js";
import type { ServiceRegistry } from "../config/services.js";

declare module "hono" {
    interface ContextVariableMap {
        requestId: string;
        gatewayEnv: GatewayEnv;
        services: ServiceRegistry;
        gatewayAuth?: { userId: string; roles: string[] };
    }
}

export {};
