import type { Context } from "hono";
import { UserService } from "../services/user.service.js";
import { getUserFromHeaders } from "@glybette/utils";
import { UnauthorizedError } from "@glybette/utils";
import type { VerificationStatusResponse } from "@glybette/contracts";

export class UserController {
    constructor(private userService: UserService) {}

    /** GET /users/me - return current user from gateway-forwarded headers. */
    async getSelf(c: Context): Promise<Response> {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth) {
            throw new UnauthorizedError("Missing auth context");
        }
        const user = await this.userService.getById(auth.userId);
        return c.json({ user });
    }

    /** GET /users/verification-state - return email verification requirement for current user. */
    async getVerificationState(c: Context): Promise<Response> {
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
