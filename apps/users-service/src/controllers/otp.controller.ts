import type { Context } from "hono";
import { UnauthorizedError, BadRequestError } from "@glybette/utils";
import { getUserFromHeaders } from "@glybette/utils";
import type { OtpRequestResponse, OtpVerifyResponse, VerificationStatusResponse } from "@glybette/contracts";
import { OtpService } from "../services/otp.service.js";
import { UserService } from "../services/user.service.js";

type VerifyOtpBody = {
    code?: string;
};

export class OtpController {
    constructor(
        private readonly otpService: OtpService,
        private readonly userService: UserService,
    ) {}

    async requestOtp(c: Context): Promise<Response> {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth) {
            throw new UnauthorizedError("Missing auth context");
        }

        const data = await this.otpService.requestVerificationOtp(auth.userId);
        const response: OtpRequestResponse = {
            ok: true,
            expiresInSeconds: data.expiresInSeconds,
            cooldownSeconds: data.cooldownSeconds,
        };
        return c.json(response, 200);
    }

    async verifyOtp(c: Context): Promise<Response> {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth) {
            throw new UnauthorizedError("Missing auth context");
        }

        const body = (await c.req.json()) as VerifyOtpBody;
        if (!body.code || body.code.trim().length !== 6) {
            throw new BadRequestError("A valid 6-digit OTP code is required");
        }

        await this.otpService.verifyEmailOtp(auth.userId, body.code.trim());
        const response: OtpVerifyResponse = { ok: true, verified: true };
        return c.json(response, 200);
    }

    async verificationStatus(c: Context): Promise<Response> {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth) {
            throw new UnauthorizedError("Missing auth context");
        }

        const state = await this.userService.getVerificationState(auth.userId);
        const response: VerificationStatusResponse = {
            requiresEmailVerification: state.requiresEmailVerification,
            email: state.email,
        };
        return c.json(response, 200);
    }
}
