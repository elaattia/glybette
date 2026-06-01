import { z } from "zod";

const schema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT_CV_SERVICE: z.coerce.number().default(3006),
    PORT_USERS_SERVICE: z.coerce.number().default(3001),
    MONGODB_URI: z.string().min(1),
    AI_SERVICE_URL: z.string().url(),
    USERS_SERVICE_URL: z.string().url().optional(),
    RABBITMQ_URL: z.string().optional(),
    INTERNAL_SERVICE_SECRET: z.string().min(1),
    INTEROP_SYNC_TIMEOUT_MS: z.coerce.number().min(1000).max(60000).default(7000),
});

export type CvServiceEnv = z.infer<typeof schema>;

export function loadEnv(): CvServiceEnv {
    const result = schema.safeParse(process.env);
    if (!result.success) {
        console.error(" [cv-service] Invalid env:", result.error.flatten().fieldErrors);
        process.exit(1);
    }
    return result.data;
}
