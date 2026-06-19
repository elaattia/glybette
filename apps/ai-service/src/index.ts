import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { loadEnv } from "./config/env.js";
import { createAiProvider } from "./lib/create-ai-provider.js";
import { internalAuthMiddleware } from "./middleware/internal-auth.middleware.js";
import { createCvRoutes } from "./routes/cv.routes.js";
import { createJobsRoutes } from "./routes/jobs.routes.js";

const env = loadEnv();
const provider = createAiProvider(env);
const app = new Hono();

app.use("*", logger());
app.use("*", cors({ origin: "*" }));

app.get("/health", async (c) => {
    const providerOk = await provider.ping();

    if (!providerOk) {
        return c.json(
            {
                status: "degraded",
                service: "ai-service",
                provider: provider.name,
                upstream: "unreachable",
            },
            503,
        );
    }

    return c.json({
        status: "ok",
        service: "ai-service",
        provider: provider.name,
        upstream: "connected",
    });
});

app.use("/ai/*", internalAuthMiddleware);
app.route("/ai/cv", createCvRoutes(provider));
app.route("/ai/jobs", createJobsRoutes(provider));

app.onError((err, c) => {
    console.error("[ai-service error]", err);
    return c.json({ error: err.message ?? "Internal error" }, 500);
});

serve({ fetch: app.fetch, port: env.PORT_AI_SERVICE }, () => {
    console.log(`[ai-service]  running on port ${env.PORT_AI_SERVICE} | provider: ${provider.name}`);

    provider.ping().then((ok) => {
        if (!ok) {
            console.warn(`[ai-service]   ${provider.name} provider not reachable at startup.`);
            if (provider.name === "ollama") {
                console.warn(`  Run: ollama pull ${env.OLLAMA_MODEL}`);
            }
        } else {
            console.log(`[ai-service]  ${provider.name} provider connected`);
        }
    });
});
