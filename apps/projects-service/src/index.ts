import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createUploadProvider } from "@glybette/uploads";
import {
    connectRabbitMq,
    ensureProjectsTopology,
    PROJECTS_EXCHANGE,
    ROUTING_KEY_PROJECT_COMMENT_CREATED,
    ROUTING_KEY_PROJECT_JOIN_REQUEST_APPROVED,
    ROUTING_KEY_PROJECT_JOIN_REQUEST_CREATED,
    ROUTING_KEY_PROJECT_JOIN_REQUEST_REJECTED,
    type ProjectDomainEvent,
    type ProjectEventName,
} from "@glybette/messaging";
import { connectDb } from "./config/db.js";
import { loadProjectsServiceEnv, resolveUploadProviderConfig } from "./config/env.js";
import { ProjectsController } from "./controllers/projects.controller.js";
import { errorHandler } from "./middleware/error-handler.js";
import { registerProjectsRoutes } from "./routes/projects.routes.js";
import { ProjectsService } from "./services/projects.service.js";
import { randomUUID } from "node:crypto";

const projectEventRoutingKeys: Record<ProjectEventName, string> = {
    join_request_created: ROUTING_KEY_PROJECT_JOIN_REQUEST_CREATED,
    join_request_approved: ROUTING_KEY_PROJECT_JOIN_REQUEST_APPROVED,
    join_request_rejected: ROUTING_KEY_PROJECT_JOIN_REQUEST_REJECTED,
    project_comment_created: ROUTING_KEY_PROJECT_COMMENT_CREATED,
};

async function connectProjectsRabbitMqWithWarnings(rabbitMqUrl: string) {
    try {
        const rabbit = await connectRabbitMq(rabbitMqUrl);
        await ensureProjectsTopology(rabbit.channel);
        console.warn("[projects-service] RabbitMQ connection established.");
        return rabbit;
    } catch (error) {
        const message = error instanceof Error ? error.message : "unknown connection error";
        console.warn(
            `[projects-service] RabbitMQ unavailable at ${rabbitMqUrl}. Events will not be emitted. Reason: ${message}`,
        );
        return null;
    }
}

async function main() {
    const env = loadProjectsServiceEnv();
    await connectDb(env);
    const rabbit = env.RABBITMQ_URL ? await connectProjectsRabbitMqWithWarnings(env.RABBITMQ_URL) : null;

    const uploadProvider = createUploadProvider(resolveUploadProviderConfig(env));
    const projectsService = new ProjectsService(async (eventName, payload) => {
        if (!rabbit) return;
        const routingKey = projectEventRoutingKeys[eventName];
        if (!routingKey) return;

        const actorUserId = String(
            payload.actorUserId ?? payload.ownerId ?? payload.requesterId ?? payload.authorId ?? "unknown",
        );
        const projectId = String(payload.projectId ?? "");
        const event: ProjectDomainEvent = {
            eventId: randomUUID(),
            eventName,
            projectId,
            actorUserId,
            occurredAtIso: new Date().toISOString(),
            payload,
        };

        rabbit.publishJsonTo(PROJECTS_EXCHANGE, routingKey, event);
    });
    await projectsService.ensureIndexes();

    const app = new Hono();
    app.onError(errorHandler);

    app.get("/", (c) => c.text("Projects service"));
    app.get("/health", (c) => c.json({ status: "ok" }));

    registerProjectsRoutes(
        app,
        new ProjectsController(
            projectsService,
            uploadProvider,
            env.PROJECTS_UPLOAD_DISK_DIR,
            env.PROJECTS_UPLOAD_MAX_MB,
        ),
    );

    serve(
        {
            fetch: app.fetch,
            port: env.PORT_PROJECTS_SERVICE,
        },
        (info) => {
            console.log(`Projects service running on http://localhost:${info.port}`);
        },
    );
}

main().catch((err) => {
    const message = err instanceof Error ? err.message : "unknown startup error";
    console.error(`Failed to start projects-service: ${message}`);
    process.exit(1);
});
