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
});

export type PortfolioServiceEnv = z.infer<typeof portfolioServiceEnvSchema>;

export function loadPortfolioServiceEnv(
    env: Record<string, string | undefined> = process.env,
): PortfolioServiceEnv {
    return portfolioServiceEnvSchema.parse(env);
}
