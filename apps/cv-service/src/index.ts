import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import mongoose from "mongoose";
import {
    connectRabbitMq,
    CV_USER_PROJECTION_QUEUE,
    ensureCvUserProjectionTopology,
    isUserProfileUpsertedEvent,
} from "@glybette/messaging";
import type { ResolveUsersResponse } from "@glybette/contracts";
import { internalRequestJson } from "@glybette/utils";
import { connectDb } from "./config/db.js";
import { cvRoutes, publicCvRoutes } from "./routes/cv.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { loadEnv } from "./config/env.js";
import { cvService } from "./controllers/cv.controller.js";

const env = loadEnv();
const app = new Hono();

app.use("*", logger());
app.use(
    "*",
    cors({
        origin: process.env.ALLOWED_ORIGINS?.split(",") ?? ["http://localhost:5173"],
        credentials: true,
    }),
);

app.get("/health", async (c) => {
    try {
        const mongoState = mongoose.connection.readyState;
        const isHealthy = mongoState === 1;

        if (!isHealthy) {
            return c.json({ 
                status: "degraded", 
                service: "cv-service", 
                mongodb: mongoState === 2 ? "connecting" : "disconnected" 
            }, mongoState === 2 ? 200 : 503);
        }

        return c.json({ 
            status: "ok", 
            service: "cv-service",
            mongodb: "healthy" 
        });
    } catch (err) {
        return c.json({ 
            status: "unhealthy", 
            service: "cv-service",
            error: err instanceof Error ? err.message : "unknown error"
        }, 503);
    }
});

app.route("/api", publicCvRoutes);

app.route("/api/cvs", cvRoutes);

app.onError((err, c) => errorMiddleware(err as Error & { status?: number }, c));

connectDb()
    .then(async () => {
        const usersServiceBaseUrl = (env.USERS_SERVICE_URL ?? `http://localhost:${env.PORT_USERS_SERVICE}`).replace(/\/$/, "");
        cvService.setUserResolver(async (userIds) => {
            if (userIds.length === 0) return [];
            const response = await internalRequestJson<ResolveUsersResponse>(`${usersServiceBaseUrl}/users/resolve`, {
                method: "POST",
                timeoutMs: env.INTEROP_SYNC_TIMEOUT_MS,
                internalSecret: env.INTERNAL_SERVICE_SECRET,
                body: JSON.stringify({ userIds }),
            });
            return response.users;
        });
        await cvService.ensureUserProjectionIndexes();

        const rabbit = env.RABBITMQ_URL ? await connectRabbitMq(env.RABBITMQ_URL).catch(() => null) : null;
        if (rabbit) {
            await ensureCvUserProjectionTopology(rabbit.channel);
            await rabbit.consumeJson(CV_USER_PROJECTION_QUEUE, async (payload) => {
                if (!isUserProfileUpsertedEvent(payload)) {
                    throw new Error("Invalid users profile event payload");
                }
                await cvService.applyUserProfileUpsertedEvent(payload);
            });
            console.warn("[cv-service] RabbitMQ connection established.");
        }

        serve({ fetch: app.fetch, port: env.PORT_CV_SERVICE });
        console.log(`[cv-service] running on port ${env.PORT_CV_SERVICE}`);
    })
    .catch((err) => {
        console.error("[cv-service]  MongoDB connection failed:", err);
        process.exit(1);
    });
