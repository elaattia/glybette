import type { GatewayEnv } from "./env.js";

export interface UsersServiceConfig {
    baseUrl: string;
}

export interface ServiceRegistry {
    users: UsersServiceConfig;
}

export function buildServiceRegistry(env: GatewayEnv): ServiceRegistry {
    const raw = env.USERS_SERVICE_URL ?? `http://localhost:${env.PORT_USERS_SERVICE}`;
    return {
        users: { baseUrl: raw.replace(/\/$/, "") },
    };
}
