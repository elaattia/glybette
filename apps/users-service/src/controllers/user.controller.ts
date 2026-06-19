import type { Context } from "hono";
import { UserService } from "../services/user.service.js";
import { getUserFromHeaders } from "@glybette/utils";
import { ACCOUNT_STATUSES, BASE_ROLES, type AccountStatus, type BaseRole } from "@glybette/contracts";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@glybette/utils";
import type {
    AdminUsersListResponse,
    OwnAccountResponse,
    OwnProfileResponse,
    UpdateOwnAccountRequest,
    ResolveUsersRequest,
    ResolveUsersResponse,
    UpdateOwnProfileRequest,
    VerificationStatusResponse,
    CompleteOnboardingRequest,
    CompleteOnboardingResponse,
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
    async getOwnProfile(c: Context): Promise<Response> {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth) {
            throw new UnauthorizedError("Missing auth context");
        }
        const profile = await this.userService.getOwnProfile(auth.userId);
        const response: OwnProfileResponse = { profile };
        return c.json(response, 200);
    }

    /** PUT /users/me/profile - update current user profile. */
    async updateOwnProfile(c: Context): Promise<Response> {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth) {
            throw new UnauthorizedError("Missing auth context");
        }
        const body = (await c.req.json().catch(() => null)) as UpdateOwnProfileRequest | null;
        if (!body || !body.profile || typeof body.profile !== "object") {
            throw new BadRequestError("Invalid profile payload.");
        }

        const profile = await this.userService.updateOwnProfile(auth.userId, body);
        const response: OwnProfileResponse = { profile };
        return c.json(response, 200);
    }

    /** PUT /users/me/account - update current account identity fields. */
    async updateOwnAccount(c: Context): Promise<Response> {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth) {
            throw new UnauthorizedError("Missing auth context");
        }
        const body = (await c.req.json().catch(() => null)) as UpdateOwnAccountRequest | null;
        if (!body || typeof body.firstName !== "string" || typeof body.lastName !== "string" || typeof body.email !== "string") {
            throw new BadRequestError("Invalid account payload.");
        }

        const account = await this.userService.updateOwnAccount(auth.userId, body);
        const response: OwnAccountResponse = account;
        return c.json(response, 200);
    }

    /** PUT /users/me/onboarding - Complete onboarding by setting role and optional companyName */
    async completeOnboarding(c: Context): Promise<Response> {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth) {
            throw new UnauthorizedError("Missing auth context");
        }
        const body = (await c.req.json().catch(() => null)) as CompleteOnboardingRequest | null;
        if (!body || !["student", "enterprise"].includes(body.role)) {
            throw new BadRequestError("Invalid onboarding payload.");
        }
        if (body.role === "enterprise" && (!body.companyName || body.companyName.trim().length === 0)) {
            throw new BadRequestError("Company name is required for enterprise role.");
        }

        const user = await this.userService.completeOnboarding(auth.userId, body.role, body.companyName);
        const response: CompleteOnboardingResponse = { ok: true, baseRole: user.baseRole };
        return c.json(response, 200);
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

    /** GET /users/admin/accounts - list user accounts for admin management. */
    async listAccounts(c: Context): Promise<Response> {
        this.requireAdmin(c);
        const limit = Number(c.req.query("limit") ?? "100");
        const response: AdminUsersListResponse = await this.userService.listUsers(Number.isFinite(limit) ? limit : 100);
        return c.json(response, 200);
    }

    /** GET /users/admin/overview-stats - aggregated metrics for admin dashboard. */
    async getAdminOverviewStats(c: Context): Promise<Response> {
        this.requireAdmin(c);
        return c.json(await this.userService.getAdminOverviewStats(), 200);
    }

    /** PATCH /users/admin/accounts/:id/status - ban/unban account and revoke sessions on ban. */
    async setAccountStatus(c: Context): Promise<Response> {
        const auth = this.requireAdmin(c);
        const targetUserId = this.requireObjectId(c.req.param("id"), "user id");
        if (targetUserId === auth.userId) {
            throw new BadRequestError("Admin cannot change their own account status.");
        }
        const body = (await c.req.json().catch(() => null)) as { accountStatus?: AccountStatus } | null;
        const accountStatus = body?.accountStatus;
        if (!accountStatus || !ACCOUNT_STATUSES.includes(accountStatus)) {
            throw new BadRequestError("Invalid account status.");
        }
        const user = await this.userService.updateAccountStatus(targetUserId, accountStatus);
        return c.json({ user }, 200);
    }

    /** PATCH /users/admin/accounts/:id/verification - verify/revoke email verification. */
    async setVerification(c: Context): Promise<Response> {
        this.requireAdmin(c);
        const targetUserId = this.requireObjectId(c.req.param("id"), "user id");
        const body = (await c.req.json().catch(() => null)) as { emailVerified?: boolean } | null;
        if (typeof body?.emailVerified !== "boolean") {
            throw new BadRequestError("Invalid verification payload.");
        }
        const user = await this.userService.setEmailVerification(targetUserId, body.emailVerified);
        return c.json({ user }, 200);
    }

    /** PATCH /users/admin/accounts/:id/base-role - change student/enterprise base role. */
    async setBaseRole(c: Context): Promise<Response> {
        this.requireAdmin(c);
        const targetUserId = this.requireObjectId(c.req.param("id"), "user id");
        const body = (await c.req.json().catch(() => null)) as { baseRole?: BaseRole } | null;
        const baseRole = body?.baseRole;
        if (!baseRole || !BASE_ROLES.includes(baseRole)) {
            throw new BadRequestError("Invalid base role.");
        }
        const user = await this.userService.setBaseRole(targetUserId, baseRole);
        return c.json({ user }, 200);
    }

    /** PATCH /users/admin/accounts/:id/admin - grant/revoke admin elevation. */
    async setAdminElevation(c: Context): Promise<Response> {
        this.requireAdmin(c);
        const targetUserId = this.requireObjectId(c.req.param("id"), "user id");
        const body = (await c.req.json().catch(() => null)) as { isAdmin?: boolean } | null;
        if (typeof body?.isAdmin !== "boolean") {
            throw new BadRequestError("Invalid admin elevation payload.");
        }
        const user = await this.userService.setAdminElevation(targetUserId, body.isAdmin);
        return c.json({ user }, 200);
    }

    /** DELETE /users/admin/accounts/:id - permanently delete account and sessions. */
    async deleteAccount(c: Context): Promise<Response> {
        const auth = this.requireAdmin(c);
        const targetUserId = this.requireObjectId(c.req.param("id"), "user id");
        if (targetUserId === auth.userId) {
            throw new BadRequestError("Admin cannot delete their own account.");
        }
        const existing = await this.userService.getById(targetUserId).catch(() => null);
        if (!existing) {
            throw new NotFoundError("User not found");
        }
        await this.userService.deleteUser(targetUserId);
        return c.json({ ok: true }, 200);
    }

    private requireInternalSecret(c: Context): void {
        const secret = c.req.header("x-internal-secret");
        if (!secret || secret !== this.internalServiceSecret) {
            throw new UnauthorizedError("Invalid internal service secret.");
        }
    }

    private requireAdmin(c: Context) {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth?.userId) {
            throw new UnauthorizedError("Missing auth context");
        }
        if (!auth.isAdmin && !auth.roles.includes("admin")) {
            throw new UnauthorizedError("Admin role required");
        }
        return auth;
    }

    private requireObjectId(value: string | undefined, label: string): string {
        const parsed = String(value ?? "").trim();
        if (!/^[0-9a-fA-F]{24}$/.test(parsed)) {
            throw new BadRequestError(`Invalid ${label}.`);
        }
        return parsed;
    }
}
