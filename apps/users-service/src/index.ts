import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { loadUsersServiceEnv } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { createAuth } from "./config/auth.js";
import { AuthController } from "./controllers/auth.controller.js";
import { UserController } from "./controllers/user.controller.js";
import { UserService } from "./services/user.service.js";
import { registerAuthRoutes } from "./routes/auth.routes.js";
import { registerUserRoutes } from "./routes/user.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

async function main() {
    const env = loadUsersServiceEnv();
    await connectDb(env);

    const auth = createAuth(env);
    const userService = new UserService();
    const authController = new AuthController(auth);
    const userController = new UserController(userService);

    const app = new Hono();
    app.onError(errorHandler);

    app.get("/", (c) => c.text("Users service"));
    app.get("/health", (c) => c.json({ status: "ok" }));

    registerAuthRoutes(app, authController);
    registerUserRoutes(app, userController);

    serve(
        {
            fetch: app.fetch,
            port: env.PORT_USERS_SERVICE,
        },
        (info) => {
            console.log(`Users service running on http://localhost:${info.port}`);
        },
    );
}

main().catch((err) => {
    console.error("Failed to start users-service:", err);
    process.exit(1);
});
