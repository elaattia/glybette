import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { loadPortfolioServiceEnv } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { errorHandler } from "./middleware/error-handler.js";
import { PortfolioService } from "./services/portfolio.service.js";
import { PortfolioController } from "./controllers/portfolio.controller.js";
import { registerPortfolioRoutes } from "./routes/portfolio.routes.js";

async function main() {
    const env = loadPortfolioServiceEnv();
    await connectDb(env);

    const portfolioService = new PortfolioService();
    await portfolioService.ensureIndexes();

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
