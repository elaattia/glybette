import { z } from "zod";

const schema = z
    .object({
        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
        PORT_AI_SERVICE: z.coerce.number().default(3007),
        INTERNAL_SERVICE_SECRET: z.string().min(1),
        AI_PROVIDER: z.enum(["ollama", "anthropic", "gemini"]).default("ollama"),
        OLLAMA_BASE_URL: z.string().url().default("http://localhost:11434"),
        OLLAMA_MODEL: z.string().default("mistral"),
        GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
        ANTHROPIC_API_KEY: z.string().optional(),
        GEMINI_API_KEY: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.AI_PROVIDER === "gemini" && !data.GEMINI_API_KEY?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "GEMINI_API_KEY is required when AI_PROVIDER=gemini",
                path: ["GEMINI_API_KEY"],
            });
        }
    });

export type AiServiceEnv = z.infer<typeof schema>;

export function loadEnv(): AiServiceEnv {
    const result = schema.safeParse(process.env);
    if (!result.success) {
        console.error(" [ai-service] Invalid env:", result.error.flatten().fieldErrors);
        process.exit(1);
    }
    return result.data;
}
