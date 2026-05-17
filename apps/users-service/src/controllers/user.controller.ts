import type { Context } from "hono";
import { UserService } from "../services/user.service.js";
import { getUserFromHeaders } from "@glybette/utils";
import { BadRequestError, UnauthorizedError } from "@glybette/utils";
import type {
    ResolveUsersRequest,
    ResolveUsersResponse,
    UpdateOwnProfileRequest,
    VerificationStatusResponse,
} from "@glybette/contracts";

export class UserController {
    constructor(
        private userService: UserService,
        private internalServiceSecret: string,
    ) {}

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

    /** PUT /users/me/profile - update current user profile and emit profile event. */
    async updateOwnProfile(c: Context): Promise<Response> {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth) {
            throw new UnauthorizedError("Missing auth context");
        }
        const body = (await c.req.json().catch(() => null)) as UpdateOwnProfileRequest | null;
        if (!body || typeof body.displayName !== "string") {
            throw new BadRequestError("Invalid profile payload.");
        }

        const user = await this.userService.updateOwnProfile(auth.userId, body);
        return c.json({ user }, 200);
    }

    /** POST /users/resolve - internal API to resolve public summaries for multiple users. */
    async resolveUsers(c: Context): Promise<Response> {
        this.requireInternalSecret(c);
        if (getUserFromHeaders(c.req.raw.headers)) {
            throw new UnauthorizedError("This endpoint is internal-only.");
        }

        const body = (await c.req.json().catch(() => null)) as ResolveUsersRequest | null;
        const userIds = Array.isArray(body?.userIds) ? body.userIds : [];
        if (userIds.length > 200) {
            throw new BadRequestError("Maximum 200 user IDs per resolve request.");
        }

        const users = await this.userService.resolvePublicByIds(userIds);
        const response: ResolveUsersResponse = { users };
        return c.json(response, 200);
    }

    private requireInternalSecret(c: Context): void {
        const secret = c.req.header("x-internal-secret");
        if (!secret || secret !== this.internalServiceSecret) {
            throw new UnauthorizedError("Invalid internal service secret.");
        }
    }
}
