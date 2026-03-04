import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { loadEnv } from "@glybette/env";

const env = loadEnv();

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

app.get("/users", (c) => c.json([]));

app.get("/users/:id", (c) => {
    const id = c.req.param("id");
    return c.json({ id, message: "User stub" });
});

serve(
    {
        fetch: app.fetch,
        port: env.PORT_USERS_SERVICE,
    },
    (info) => {
        console.log(`Users service running on http://localhost:${info.port}`);
    },
);
