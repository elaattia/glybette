import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { loadEnv } from "./config/env.js";
import { internalAuthMiddleware } from "./middleware/internal-auth.middleware.js";
import { cvRoutes } from "./routes/cv.routes.js";
import { pingOllama } from "./lib/ollama.js";

const env = loadEnv();
const app = new Hono();

app.use("*", logger());
app.use("*", cors({ origin: "*" }));

app.get("/health", async (c) => {
    const ollamaOk = await pingOllama();
    return c.json({
        status: "ok",
        service: "ai-service",
        provider: env.AI_PROVIDER,
        ollama: ollamaOk ? "connected" : "unreachable",
    });
});

app.use("/ai/*", internalAuthMiddleware);
app.route("/ai/cv", cvRoutes);

app.onError((err, c) => {
    console.error("[ai-service error]", err);
    return c.json({ error: err.message ?? "Internal error" }, 500);
});

serve(
    { fetch: app.fetch, port: env.PORT_AI_SERVICE },
    () => {
        console.log(`[ai-service]  running on port ${env.PORT_AI_SERVICE} | provider: ${env.AI_PROVIDER}`);

        if (env.AI_PROVIDER === "ollama") {
            pingOllama().then((ok) => {
                if (!ok) {
                    console.warn("[ai-service]   Ollama not reachable.");
                    console.warn(`  Run: ollama pull ${env.OLLAMA_MODEL}`);
                } else {
                    console.log(`[ai-service]  Ollama connected — model: ${env.OLLAMA_MODEL}`);
                }
            });
        }
    }
);