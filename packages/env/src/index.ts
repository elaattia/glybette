import { z } from "zod";
import { config as dotenvConfig } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export { z };

const loadedEnvPaths = new Set<string>();

function loadDotenvFile(path: string) {
    if (loadedEnvPaths.has(path)) {
        return;
    }
    const result = dotenvConfig({ path, override: false });
    if (!result.error) {
        loadedEnvPaths.add(path);
    }
}

function bootstrapEnv() {
    const cwd = process.cwd();
    const packageDir = dirname(fileURLToPath(import.meta.url));
    const candidates = [
        resolve(cwd, ".env"),
        resolve(cwd, ".env.local"),
        resolve(cwd, "../../.env"),
        resolve(cwd, "../../.env.local"),
        resolve(packageDir, "../../../.env"),
        resolve(packageDir, "../../../.env.local"),
    ];

    for (const candidate of candidates) {
        loadDotenvFile(candidate);
    }
}

bootstrapEnv();

const mongoUriSchema = z
    .string()
    .min(1, "MONGODB_URI is required")
    .refine(
        (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
        "MONGODB_URI must be a valid MongoDB connection string",
    );

export const baseEnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    MONGODB_URI: z.string().optional(),
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
