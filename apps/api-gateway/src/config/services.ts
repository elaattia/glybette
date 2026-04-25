import type { GatewayEnv } from "./env.js";

export interface UsersServiceConfig {
    baseUrl: string;
}

export interface ScrapingServiceConfig {
    baseUrl: string;
}

export interface ServiceRegistry {
    users: UsersServiceConfig;
    scraping: ScrapingServiceConfig;
    email: { baseUrl: string };
}



export function buildServiceRegistry(env: GatewayEnv): ServiceRegistry {
    const raw = env.USERS_SERVICE_URL ?? `http://localhost:${env.PORT_USERS_SERVICE}`;
    const scrapingRaw = env.SCRAPING_SERVICE_URL ?? `http://localhost:${env.PORT_SCRAPING_SERVICE}`;
    const emailRaw = env.EMAIL_SERVICE_URL ?? `http://localhost:${env.PORT_EMAIL_SERVICE}`;

    return {
        users: { baseUrl: raw.replace(/\/$/, "") },
        scraping: { baseUrl: scrapingRaw.replace(/\/$/, "") },
        email: { baseUrl: emailRaw.replace(/\/$/, "") },
    };
}