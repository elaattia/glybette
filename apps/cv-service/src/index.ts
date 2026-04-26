import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { connectDb } from "./config/db.js";
import { cvRoutes, publicCvRoutes } from "./routes/cv.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { loadEnv } from "./config/env.js";

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

app.get("/health", (c) => c.json({ status: "ok", service: "cv-service" }));

app.route("/api", publicCvRoutes);

app.route("/api/cvs", cvRoutes);

app.onError((err, c) => errorMiddleware(err as Error & { status?: number }, c));

connectDb()
    .then(() => {
        serve({ fetch: app.fetch, port: env.PORT_CV_SERVICE });
        console.log(`[cv-service]  running on port ${env.PORT_CV_SERVICE}`);
    })
    .catch((err) => {
        console.error("[cv-service]  MongoDB connection failed:", err);
        process.exit(1);
    });
