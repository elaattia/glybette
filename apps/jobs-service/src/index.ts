import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { connectDb } from "./config/db.js";
import { loadEnv } from "./config/env.js";
import { startOffreConsumer } from "./consumers/offre.consumer.js";
import { publicRoutes, protectedRoutes } from "./routes/jobs.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { OffreModel } from "./models/Offre.model.js";
import { bootstrapOffresFromScrapingDb } from "./services/bootstrap-offres.service.js";

const env = loadEnv();
const app = new Hono();

app.use("*", logger());
app.use("*", cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? ["http://localhost:5173"],
    credentials: true,
}));

app.get("/health", async (c) => {
    try {
        const mongoHealthy = await OffreModel.collection.indexInformation()
            .then(() => true)
            .catch(() => false);

        if (!mongoHealthy) {
            return c.json({ 
                status: "degraded", 
                service: "jobs-service", 
                mongodb: "unhealthy" 
            }, 503);
        }

        return c.json({ 
            status: "ok", 
            service: "jobs-service",
            mongodb: "healthy" 
        });
    } catch (err) {
        return c.json({ 
            status: "unhealthy", 
            service: "jobs-service",
            error: err instanceof Error ? err.message : "unknown error"
        }, 503);
    }
});

app.route("/api", publicRoutes);        
app.route("/api", protectedRoutes);     

app.post("/internal/archive", async (c) => {
    const secret = c.req.header("x-internal-secret");
    if (secret !== env.INTERNAL_SERVICE_SECRET) return c.json({ error: "Forbidden" }, 403);
    
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 60);

    const result = await OffreModel.updateMany(
        { date_scraped: { $lt: limitDate }, status: "active" },
        { $set: { status: "archivee", date_updated: new Date() } }
    );

    console.log(`[jobs-service] Archivage: ${result.modifiedCount} offres archivées.`);
    return c.json({ ok: true, archivedCount: result.modifiedCount });
});

app.onError((err, c) => errorMiddleware(err as Error & { status?: number }, c));

connectDb()
    .then(async () => {
        await bootstrapOffresFromScrapingDb();
        serve({ fetch: app.fetch, port: env.PORT_JOBS_SERVICE });

        console.log(`[jobs-service]  running on port ${env.PORT_JOBS_SERVICE}`);

        startOffreConsumer().catch((err) => {
            console.error("[jobs-service]  consumer failed:", err);
        });
    })
    .catch((err) => {
        console.error("[jobs-service]  startup failed:", err);
        process.exit(1);
    });