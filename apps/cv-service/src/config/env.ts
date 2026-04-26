import { z } from "zod";

const schema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT_CV_SERVICE: z.coerce.number().default(3003),
    MONGODB_URI: z.string().min(1),
    AI_SERVICE_URL: z.string().url().default("http://localhost:3004"),
    INTERNAL_SERVICE_SECRET: z.string().min(1),
});

export type CvServiceEnv = z.infer<typeof schema>;

export function loadEnv(): CvServiceEnv {
    const result = schema.safeParse(process.env);
    if (!result.success) {
        console.error("❌ [cv-service] Invalid env:", result.error.flatten().fieldErrors);
        process.exit(1);
    }
    return result.data;
}
