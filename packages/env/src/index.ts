import { z } from "zod";

export { z };

const mongoUriSchema = z
    .string()
    .min(1, "MONGODB_URI is required")
    .refine(
        (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
        "MONGODB_URI must be a valid MongoDB connection string",
    );

export const baseEnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    MONGODB_URI: mongoUriSchema.optional(),
    PORT_API_GATEWAY: z.coerce.number().default(3000),
    PORT_USERS_SERVICE: z.coerce.number().default(3001),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

export function loadEnv(env: Record<string, string | undefined> = process.env): BaseEnv {
    return baseEnvSchema.parse(env);
}

export function loadEnvSafe(
    env: Record<string, string | undefined> = process.env,
): z.SafeParseReturnType<unknown, BaseEnv> {
    return baseEnvSchema.safeParse(env);
}
