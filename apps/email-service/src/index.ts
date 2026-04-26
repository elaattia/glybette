import { serve } from "@hono/node-server";
import { Hono } from "hono";
import {
    AUTH_EMAIL_QUEUE,
    connectRabbitMq,
    ensureAuthEmailTopology,
    isOtpEmailRequestedEvent,
    type OtpEmailRequestedEvent,
} from "@glybette/messaging";
import { loadEmailServiceEnv } from "./config/env.js";
import type { EmailProvider } from "./email/provider.js";
import { MockEmailProvider } from "./email/mock-provider.js";
import { ResendEmailProvider } from "./email/resend-provider.js";

function createEmailProvider(env: ReturnType<typeof loadEmailServiceEnv>): EmailProvider {
    if (env.EMAIL_PROVIDER === "resend") {
        if (!env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER is resend");
        }
        return new ResendEmailProvider(env.RESEND_API_KEY, env.EMAIL_FROM);
    }

    return new MockEmailProvider();
}

async function main() {
    const env = loadEmailServiceEnv();
    const provider = createEmailProvider(env);

    const rabbit = await connectRabbitMq(env.RABBITMQ_URL);
    await ensureAuthEmailTopology(rabbit.channel);

    await rabbit.consumeJson<OtpEmailRequestedEvent>(AUTH_EMAIL_QUEUE, async (payload) => {
        if (!isOtpEmailRequestedEvent(payload)) {
            throw new Error("Invalid OTP event payload");
        }

        const startedAt = Date.now();
        await provider.sendEmailVerificationOtp({
            to: payload.email,
            otpCode: payload.otpCode,
            expiresAtIso: payload.expiresAtIso,
        });
        console.log(
            JSON.stringify({
                event: "otp_email_sent",
                correlationId: payload.correlationId,
                userId: payload.userId,
                durationMs: Date.now() - startedAt,
            }),
        );
    });

    const app = new Hono();
    app.get("/", (c) => c.text("Email service"));
    app.get("/health", (c) => c.json({ status: "ok", name: "email-service" }, 200));

    serve(
        {
            fetch: app.fetch,
            port: env.PORT_EMAIL_SERVICE,
        },
        (info) => {
            console.log(`Email service running on http://localhost:${info.port}`);
        },
    );
}

main().catch((err) => {
    console.error("Failed to start email-service:", err);
    process.exit(1);
});
