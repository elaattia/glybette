import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { connectRabbitMq, ensurePortfolioUserProjectionTopology, isUserProfileUpsertedEvent, PORTFOLIO_USER_PROJECTION_QUEUE } from "@glybette/messaging";
import type { ResolveUsersResponse } from "@glybette/contracts";
import { internalRequestJson } from "@glybette/utils";
import { loadPortfolioServiceEnv } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { errorHandler } from "./middleware/error-handler.js";
import { PortfolioService } from "./services/portfolio.service.js";
import { PortfolioController } from "./controllers/portfolio.controller.js";
import { registerPortfolioRoutes } from "./routes/portfolio.routes.js";

async function main() {
    const env = loadPortfolioServiceEnv();
    await connectDb(env);

    const rabbit = env.RABBITMQ_URL ? await connectRabbitMq(env.RABBITMQ_URL).catch(() => null) : null;
    if (rabbit) {
        await ensurePortfolioUserProjectionTopology(rabbit.channel);
        console.warn("[portfolio-service] RabbitMQ connection established.");
    }
    const usersServiceBaseUrl = (env.USERS_SERVICE_URL ?? `http://localhost:${env.PORT_USERS_SERVICE}`).replace(/\/$/, "");

    const portfolioService = new PortfolioService(async (userIds) => {
        if (userIds.length === 0) return [];
        const response = await internalRequestJson<ResolveUsersResponse>(`${usersServiceBaseUrl}/users/resolve`, {
            method: "POST",
            timeoutMs: env.INTEROP_SYNC_TIMEOUT_MS,
            internalSecret: env.INTERNAL_SERVICE_SECRET,
            body: JSON.stringify({ userIds }),
        });
        return response.users;
    });
    await portfolioService.ensureIndexes();
    if (rabbit) {
        await rabbit.consumeJson(PORTFOLIO_USER_PROJECTION_QUEUE, async (payload) => {
            if (!isUserProfileUpsertedEvent(payload)) {
                throw new Error("Invalid users profile event payload");
            }
            await portfolioService.applyUserProfileUpsertedEvent(payload);
        });
    }

    const app = new Hono();
    app.onError(errorHandler);

    app.get("/", (c) => c.text("Portfolio service"));
    app.get("/health", (c) => c.json({ status: "ok" }));

    registerPortfolioRoutes(app, new PortfolioController(portfolioService, env.PORTFOLIO_PUBLIC_ROOT_DOMAIN));

    serve(
        {
            fetch: app.fetch,
            port: env.PORT_PORTFOLIO_SERVICE,
        },
        (info) => {
            console.log(`Portfolio service running on http://localhost:${info.port}`);
        },
    );
}

main().catch((err) => {
    const message = err instanceof Error ? err.message : "unknown startup error";
    console.error(`Failed to start portfolio-service: ${message}`);
    process.exit(1);
});
