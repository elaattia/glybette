import { baseEnvSchema, z } from "@glybette/env";

export const gatewayEnvSchema = baseEnvSchema.extend({
    USERS_SERVICE_URL: z.string().url().optional(),
    SCRAPING_SERVICE_URL: z.string().url().optional(),
    CV_SERVICE_URL: z.string().url().optional(),
    INTERNAL_SERVICE_SECRET: z.string().min(1).default("dev-secret-change-in-prod"),
    NOTIFICATIONS_SERVICE_URL: z.string().url().optional(),
    PORTFOLIO_SERVICE_URL: z.string().url().optional(),
    JOBS_SERVICE_URL: z.string().url().optional(),
    PROJECTS_SERVICE_URL: z.string().url().optional(),
    /** Comma-separated origins; defaults to local Vite dev URLs if unset. */
    CORS_ORIGINS: z.string().optional(),
    PROXY_TIMEOUT_MS: z.coerce.number().min(1000).default(30_000),
    /** Timeout for AI-heavy proxy routes (CV/jobs matching, interview, etc.). */
    AI_PROXY_TIMEOUT_MS: z.coerce.number().min(1000).max(600_000).default(180_000),
});

export type GatewayEnv = z.infer<typeof gatewayEnvSchema>;

export function loadGatewayEnv(env: Record<string, string | undefined> = process.env): GatewayEnv {
    return gatewayEnvSchema.parse(env);
}

export function resolveCorsOrigins(env: GatewayEnv): string[] {
    if (env.CORS_ORIGINS) {
        return env.CORS_ORIGINS.split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    return ["http://localhost:5173", "http://127.0.0.1:5173"];
}
