import type { GatewayEnv } from "./env.js";

export interface UsersServiceConfig {
    baseUrl: string;
}

export interface ScrapingServiceConfig {
    baseUrl: string;
}

export interface ServiceConfig {
    baseUrl: string;
}

export interface ServiceRegistry {
    users: UsersServiceConfig;
    scraping: ScrapingServiceConfig;
    cv:       ServiceConfig;
}



export function buildServiceRegistry(env: GatewayEnv): ServiceRegistry {
    const raw = env.USERS_SERVICE_URL ?? `http://localhost:${env.PORT_USERS_SERVICE}`;
    const scrapingRaw = env.SCRAPING_SERVICE_URL ?? `http://localhost:${env.PORT_SCRAPING_SERVICE}`;
    const cvRaw = env.CV_SERVICE_URL ?? `http://localhost:${env.PORT_CV_SERVICE}`;

    return {
        users: { baseUrl: raw.replace(/\/$/, "") },
        scraping: { baseUrl: scrapingRaw.replace(/\/$/, "") },
        cv: { baseUrl: cvRaw.replace(/\/$/, "") },

    };
}