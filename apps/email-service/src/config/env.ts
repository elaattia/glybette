import { z, baseEnvSchema } from "@glybette/env";

const emailServiceEnvSchema = baseEnvSchema.extend({
    RABBITMQ_URL: z.string().min(1).default("amqp://localhost:5672"),
    EMAIL_PROVIDER: z.enum(["resend", "mock"]).default("mock"),
    EMAIL_FROM: z.string().email().default("no-reply@glybette.dev"),
    RESEND_API_KEY: z.string().optional(),
});

export type EmailServiceEnv = z.infer<typeof emailServiceEnvSchema>;

export function loadEmailServiceEnv(
    env: Record<string, string | undefined> = process.env,
): EmailServiceEnv {
    return emailServiceEnvSchema.parse(env);
}
