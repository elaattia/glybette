import type { GatewayEnv } from "../config/env.js";
import type { ServiceRegistry } from "../config/services.js";
import type { GatewayAuthPayload } from "../auth/require-auth.js";

declare module "hono" {
    interface ContextVariableMap {
        requestId: string;
        gatewayEnv: GatewayEnv;
        services: ServiceRegistry;
        gatewayAuth?: GatewayAuthPayload;
    }
}

export {};
