import { z } from "zod";

const schema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT_JOBS_SERVICE: z.coerce.number().default(3005),
    MONGODB_URI: z.string().min(1),
    RABBITMQ_URL: z.string().min(1).default("amqp://guest:guest@localhost:5672/"),
    AI_SERVICE_URL: z.string().url(),
    INTERNAL_SERVICE_SECRET: z.string().min(1),
    USERS_SERVICE_URL: z.string().url(),
    AI_REQUEST_TIMEOUT_MS: z.coerce.number().min(1000).max(600_000).default(120_000),
});

export type JobsServiceEnv = z.infer<typeof schema>;

export function loadEnv(): JobsServiceEnv {
    const result = schema.safeParse(process.env);
    if (!result.success) {
        console.error("[jobs-service] Invalid env:", result.error.flatten().fieldErrors);
        process.exit(1);
    }
    return result.data;
}