import type { Hono } from "hono";
import type { OtpController } from "../controllers/otp.controller.js";

export function registerOtpRoutes(app: Hono, controller: OtpController): void {
    app.post("/auth/otp/request", (c) => controller.requestOtp(c));
    app.post("/auth/otp/verify", (c) => controller.verifyOtp(c));
    app.get("/auth/verification-status", (c) => controller.verificationStatus(c));
}
