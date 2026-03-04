import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { baseEnvSchema, z } from "@glybette/env";

const gatewayEnvSchema = baseEnvSchema.extend({
    USERS_SERVICE_URL: z.string().url().optional(),
});
type GatewayEnv = z.infer<typeof gatewayEnvSchema>;

const env = gatewayEnvSchema.parse(process.env) as GatewayEnv;

const app = new Hono();

app.use(
    "*",
    cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use("*", async (c, next) => {
    const start = Date.now();
    const reqId = crypto.randomUUID().slice(0, 8);
    console.log(`[${reqId}] ${c.req.method} ${c.req.url}`);
    await next();
    console.log(`[${reqId}] ${c.req.method} ${c.req.url} ${c.res.status} ${Date.now() - start}ms`);
});

const api = new Hono().basePath("/api");

api.get("/health", (c) => c.json({ status: "ok" }, 200));

api.get("/users", async (c) => {
    if (!env.USERS_SERVICE_URL) {
        return c.json({ message: "Users service not configured" }, 501);
    }
    try {
        const url = `${env.USERS_SERVICE_URL.replace(/\/$/, "")}/users`;
        const res = await fetch(url, { headers: c.req.raw.headers });
        const data = await res.text();
        return new Response(data, { status: res.status, headers: res.headers });
    } catch (err) {
        console.error("Proxy to users-service failed:", err);
        return c.json({ message: "Users service unavailable" }, 503);
    }
});

api.get("/users/:id", async (c) => {
    if (!env.USERS_SERVICE_URL) {
        return c.json({ message: "Users service not configured" }, 501);
    }
    const id = c.req.param("id");
    try {
        const url = `${env.USERS_SERVICE_URL.replace(/\/$/, "")}/users/${id}`;
        const res = await fetch(url, { headers: c.req.raw.headers });
        const data = await res.text();
        return new Response(data, { status: res.status, headers: res.headers });
    } catch (err) {
        console.error("Proxy to users-service failed:", err);
        return c.json({ message: "Users service unavailable" }, 503);
    }
});

app.route("/", api);

serve(
    {
        fetch: app.fetch,
        port: env.PORT_API_GATEWAY,
    },
    (info) => {
        console.log(`API gateway running on http://localhost:${info.port}`);
    },
);
