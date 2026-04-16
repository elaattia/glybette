import { serve } from "@hono/node-server";
import { loadGatewayEnv } from "./config/env.js";
import { createApp } from "./app.js";
async function main() {
    const env = loadGatewayEnv();
    const app = createApp(env);

    serve(
        {
            fetch: app.fetch,
            port: env.PORT_API_GATEWAY,
        },
        (info) => {
            console.log(`API gateway running on http://localhost:${info.port}`);
        },
    );
}

main().catch((err) => {
    console.error("Failed to start API gateway:", err);
    process.exit(1);
});
