import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { loadUsersServiceEnv } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { createAuth } from "./config/auth.js";
import { AuthController } from "./controllers/auth.controller.js";
import { OtpController } from "./controllers/otp.controller.js";
import { UserController } from "./controllers/user.controller.js";
import { connectRabbitMq, ensureAuthEmailTopology, ensureUsersTopology } from "@glybette/messaging";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OtpService } from "./services/otp.service.js";

const USERS_SERVICE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolveEmailLogDir(configuredDir: string): string {
    if (path.isAbsolute(configuredDir)) {
        return configuredDir;
    }

    return path.resolve(USERS_SERVICE_ROOT, configuredDir);
}
import { UserService } from "./services/user.service.js";
import { registerAuthRoutes } from "./routes/auth.routes.js";
import { registerOtpRoutes } from "./routes/otp.routes.js";
import { registerUserRoutes } from "./routes/user.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

async function connectRabbitMqWithWarnings(otpService: OtpService, userService: UserService, rabbitMqUrl: string): Promise<void> {
    try {
        const rabbit = await connectRabbitMq(rabbitMqUrl);
        await ensureAuthEmailTopology(rabbit.channel);
        await ensureUsersTopology(rabbit.channel);
        otpService.setRabbitClient(rabbit);
        userService.setRabbitClient(rabbit);
        console.warn("[users-service] RabbitMQ connection established.");
    } catch (error) {
        const message = error instanceof Error ? error.message : "unknown connection error";
        console.warn(
            `[users-service] RabbitMQ unavailable at ${rabbitMqUrl}. Users service will run in degraded mode. Reason: ${message}`,
        );
    }
}

async function main() {
    const env = loadUsersServiceEnv();
    await connectDb(env);

    const auth = createAuth(env);
    const userService = new UserService(null);
    const otpService = new OtpService(env, null);
    await otpService.ensureIndexes();
    await connectRabbitMqWithWarnings(otpService, userService, env.RABBITMQ_URL);
    if (env.EMAIL_DELIVERY_MODE === "file") {
        const logPath = path.join(resolveEmailLogDir(env.EMAIL_LOG_DIR), "logs.txt");
        console.warn(
            `[users-service] EMAIL_DELIVERY_MODE=file. OTP emails append to ${logPath} (email-service is bypassed).`,
        );
    }

    const authController = new AuthController(auth);
    const userController = new UserController(userService, env.INTERNAL_SERVICE_SECRET);
    const otpController = new OtpController(otpService, userService);

    const app = new Hono();
    app.onError(errorHandler);

    app.get("/", (c) => c.text("Users service"));
    app.get("/health", (c) => c.json({ status: "ok" }));

    registerAuthRoutes(app, authController);
    registerUserRoutes(app, userController);
    registerOtpRoutes(app, otpController);

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
    const message = err instanceof Error ? err.message : "unknown startup error";
    console.error(`Failed to start users-service: ${message}`);
    process.exit(1);
});
