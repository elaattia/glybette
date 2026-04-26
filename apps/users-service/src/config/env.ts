import { z } from "@glybette/env";
import { baseEnvSchema } from "@glybette/env";

const usersServiceEnvSchema = baseEnvSchema.extend({
    MONGODB_URI: z
        .string()
        .min(1)
        .refine(
            (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
            "MONGODB_URI must be a valid MongoDB connection string",
        ),
    USERS_SERVICE_MONGODB_DB_NAME: z.string().min(1).default("users"),
    BETTER_AUTH_SECRET: z.string().min(32).optional(),
    BETTER_AUTH_URL: z.string().url().optional(),
    /** Comma-separated browser origins trusted by Better Auth CSRF checks. */
    BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    LINKEDIN_CLIENT_ID: z.string().optional(),
    LINKEDIN_CLIENT_SECRET: z.string().optional(),
    EMAIL_DELIVERY_MODE: z.enum(["service", "file"]).default("service"),
    EMAIL_LOG_DIR: z.string().min(1).default("./logs"),
    RABBITMQ_URL: z.string().min(1).default("amqp://localhost:5672"),
    OTP_SECRET: z.string().min(16).default("dev-otp-secret-change-me"),
    OTP_TTL_SECONDS: z.coerce.number().int().min(60).max(3600).default(600),
    OTP_COOLDOWN_SECONDS: z.coerce.number().int().min(15).max(600).default(60),
    OTP_MAX_ATTEMPTS: z.coerce.number().int().min(3).max(10).default(5),
});

export type UsersServiceEnv = z.infer<typeof usersServiceEnvSchema>;

export function loadUsersServiceEnv(env: Record<string, string | undefined> = process.env): UsersServiceEnv {
    return usersServiceEnvSchema.parse(env);
}

export function resolveBetterAuthTrustedOrigins(env: UsersServiceEnv): string[] {
    if (env.BETTER_AUTH_TRUSTED_ORIGINS) {
        return env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
            .map((value) => value.trim())
            .filter(Boolean);
    }

    return ["http://localhost:5173", "http://127.0.0.1:5173"];
}
