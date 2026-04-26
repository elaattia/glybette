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

export interface PortfolioServiceConfig {
    baseUrl: string;
}

export interface ServiceRegistry {
    users: UsersServiceConfig;
    scraping: ScrapingServiceConfig;
    cv: ServiceConfig;
    email: { baseUrl: string };
    portfolio: PortfolioServiceConfig;
}



export function buildServiceRegistry(env: GatewayEnv): ServiceRegistry {
    const raw = env.USERS_SERVICE_URL ?? `http://localhost:${env.PORT_USERS_SERVICE}`;
    const scrapingRaw = env.SCRAPING_SERVICE_URL ?? `http://localhost:${env.PORT_SCRAPING_SERVICE}`;
    const cvRaw = env.CV_SERVICE_URL ?? "http://localhost:3003";
    const emailRaw = env.EMAIL_SERVICE_URL ?? `http://localhost:${env.PORT_EMAIL_SERVICE}`;
    const portfolioRaw =
        env.PORTFOLIO_SERVICE_URL ?? `http://localhost:${env.PORT_PORTFOLIO_SERVICE}`;

    return {
        users: { baseUrl: raw.replace(/\/$/, "") },
        scraping: { baseUrl: scrapingRaw.replace(/\/$/, "") },
        cv: { baseUrl: cvRaw.replace(/\/$/, "") },
        email: { baseUrl: emailRaw.replace(/\/$/, "") },
        portfolio: { baseUrl: portfolioRaw.replace(/\/$/, "") },
    };
}