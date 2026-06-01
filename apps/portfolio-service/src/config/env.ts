import { baseEnvSchema, z } from "@glybette/env";

const portfolioServiceEnvSchema = baseEnvSchema.extend({
    MONGODB_URI: z
        .string()
        .min(1)
        .refine(
            (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
            "MONGODB_URI must be a valid MongoDB connection string",
        ),
    PORTFOLIO_SERVICE_MONGODB_DB_NAME: z.string().min(1).default("glybette_portfolios"),
    PORTFOLIO_PUBLIC_ROOT_DOMAIN: z.string().min(1).default("glybette.com"),
    RABBITMQ_URL: z.string().optional(),
    USERS_SERVICE_URL: z.string().url().optional(),
    INTERNAL_SERVICE_SECRET: z.string().min(1).default("dev-secret-change-in-prod"),
    INTEROP_SYNC_TIMEOUT_MS: z.coerce.number().min(1000).max(60000).default(7000),
});

export type PortfolioServiceEnv = z.infer<typeof portfolioServiceEnvSchema>;

export function loadPortfolioServiceEnv(env: Record<string, string | undefined> = process.env): PortfolioServiceEnv {
    return portfolioServiceEnvSchema.parse(env);
}
