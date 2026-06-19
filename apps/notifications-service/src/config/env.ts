import { baseEnvSchema, z } from "@glybette/env";

const notificationsServiceEnvSchema = baseEnvSchema.extend({
    MONGODB_URI: z
        .string()
        .min(1)
        .refine(
            (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
            "MONGODB_URI must be a valid MongoDB connection string",
        ),
    PORT_NOTIFICATIONS_SERVICE: z.coerce.number().default(3003),
    NOTIFICATIONS_SERVICE_MONGODB_DB_NAME: z.string().min(1).default("glybette_notifications"),
    RABBITMQ_URL: z.string().min(1).default("amqp://localhost:5672"),
    EMAIL_PROVIDER: z.enum(["resend", "mock"]).default("mock"),
    EMAIL_FROM: z.string().email().default("no-reply@glybette.dev"),
    RESEND_API_KEY: z.string().optional(),
    PROJECTS_SERVICE_URL: z.string().url().optional(),
    USERS_SERVICE_URL: z.string().url().optional(),
    INTERNAL_SERVICE_SECRET: z.string().min(1).default("dev-secret-change-in-prod"),
    INTEROP_SYNC_TIMEOUT_MS: z.coerce.number().min(1000).max(60000).default(7000),
});

export type NotificationsServiceEnv = z.infer<typeof notificationsServiceEnvSchema>;

export function loadNotificationsServiceEnv(
    env: Record<string, string | undefined> = process.env,
): NotificationsServiceEnv {
    return notificationsServiceEnvSchema.parse(env);
}
