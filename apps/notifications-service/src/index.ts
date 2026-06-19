import { serve } from "@hono/node-server";
import { Hono } from "hono";
import {
    NOTIFICATIONS_AUTH_OTP_QUEUE,
    NOTIFICATIONS_PROJECTS_QUEUE,
    connectRabbitMq,
    ensureNotificationsAuthOtpTopology,
    ensureNotificationsProjectsTopology,
    isOtpEmailRequestedEvent,
    isProjectDomainEvent,
    type OtpEmailRequestedEvent,
    type ProjectDomainEvent,
} from "@glybette/messaging";
import { connectDb } from "./config/db.js";
import { loadNotificationsServiceEnv } from "./config/env.js";
import { NotificationsController } from "./controllers/notifications.controller.js";
import type { EmailProvider } from "./email/provider.js";
import { MockEmailProvider } from "./email/mock-provider.js";
import { ResendEmailProvider } from "./email/resend-provider.js";
import { errorHandler } from "./middleware/error-handler.js";
import { registerNotificationsRoutes } from "./routes/notifications.routes.js";
import { createInteropClients } from "./services/interop.clients.js";
import { NotificationsService } from "./services/notifications.service.js";

function createEmailProvider(env: ReturnType<typeof loadNotificationsServiceEnv>): EmailProvider {
    if (env.EMAIL_PROVIDER === "resend") {
        if (!env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER is resend");
        }
        return new ResendEmailProvider(env.RESEND_API_KEY, env.EMAIL_FROM);
    }

    return new MockEmailProvider(env.EMAIL_FROM);
}

async function main() {
    const env = loadNotificationsServiceEnv();
    await connectDb(env);

    const emailProvider = createEmailProvider(env);
    const { projects, users } = createInteropClients(env);
    const notificationsService = new NotificationsService(projects, users);

    const rabbit = await connectRabbitMq(env.RABBITMQ_URL);
    await ensureNotificationsAuthOtpTopology(rabbit.channel);
    await ensureNotificationsProjectsTopology(rabbit.channel);

    await rabbit.consumeJson<OtpEmailRequestedEvent>(NOTIFICATIONS_AUTH_OTP_QUEUE, async (payload) => {
        if (!isOtpEmailRequestedEvent(payload)) {
            throw new Error("Invalid OTP event payload");
        }

        const startedAt = Date.now();
        await emailProvider.sendEmailVerificationOtp({
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

    await rabbit.consumeJson<ProjectDomainEvent>(NOTIFICATIONS_PROJECTS_QUEUE, async (payload) => {
        if (!isProjectDomainEvent(payload)) {
            throw new Error("Invalid project domain event payload");
        }

        const startedAt = Date.now();
        await notificationsService.handleProjectDomainEvent(payload);
        console.log(
            JSON.stringify({
                event: "project_notification_processed",
                eventId: payload.eventId,
                eventName: payload.eventName,
                projectId: payload.projectId,
                durationMs: Date.now() - startedAt,
            }),
        );
    });

    const app = new Hono();
    app.onError(errorHandler);

    app.get("/", (c) => c.text("Notifications service"));
    app.get("/health", (c) => c.json({ status: "ok", name: "notifications-service" }, 200));

    registerNotificationsRoutes(app, new NotificationsController(notificationsService));

    serve(
        {
            fetch: app.fetch,
            port: env.PORT_NOTIFICATIONS_SERVICE,
        },
        (info) => {
            console.log(`Notifications service running on http://localhost:${info.port}`);
        },
    );
}

main().catch((err) => {
    console.error("Failed to start notifications-service:", err);
    process.exit(1);
});
