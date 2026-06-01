import mongoose from "mongoose";
import {
    ACCOUNT_STATUSES,
    AUTH_PROVIDERS,
    BASE_ROLES,
    type AccountStatus,
    type AdminUsersListResponse,
    type AuthProvider,
    type BaseRole,
    type PublicUserSummaryDTO,
    type UpdateOwnProfileRequest,
    type UserDTO,
    type UsersAdminOverviewStatsResponse,
    type UpdateOwnAccountRequest,
} from "@glybette/contracts";
import {
    ROUTING_KEY_USERS_PROFILE_UPSERTED,
    USERS_EXCHANGE,
    type RabbitMqClient,
    type UserProfileUpsertedEvent,
} from "@glybette/messaging";
import { BadRequestError, NotFoundError, fillDailyCounts, overviewGrowthStartDate } from "@glybette/utils";
import { randomUUID } from "node:crypto";

type BetterAuthUserDocument = mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    email?: string;
    emailVerifiedAt?: Date | null;
    name?: string;
    image?: string;
    isPremium?: boolean;
    baseRole?: BaseRole;
    isAdmin?: boolean;
    accountStatus?: AccountStatus;
    emailVerified?: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
};

type BetterAuthAccountDocument = {
    userId: string;
    providerId?: string;
    createdAt?: Date;
};

function isAuthProvider(value: string | undefined): value is AuthProvider {
    return Boolean(value && AUTH_PROVIDERS.includes(value as AuthProvider));
}

function normalizeProvider(value: string | undefined): AuthProvider {
    if (value === "credential") {
        return "email";
    }
    if (isAuthProvider(value)) {
        return value;
    }
    return "google";
}

function buildAuthCapabilities(accounts: BetterAuthAccountDocument[]): {
    provider: AuthProvider;
    hasPassword: boolean;
    connectedProviders: AuthProvider[];
} {
    const connectedProviders = new Set<AuthProvider>();
    let hasPassword = false;

    for (const account of accounts) {
        const provider = normalizeProvider(account.providerId);
        connectedProviders.add(provider);
        if (provider === "email") {
            hasPassword = true;
        }
    }

    const sortedAccounts = [...accounts].sort((a, b) => {
        const left = a.createdAt ? new Date(a.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
        const right = b.createdAt ? new Date(b.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
        return left - right;
    });

    const primaryProvider = sortedAccounts[0]?.providerId
        ? normalizeProvider(sortedAccounts[0].providerId)
        : hasPassword
          ? "email"
          : "google";

    const providerOrder = ["google", "github", "linkedin", "email"] as const;
    const orderedProviders: AuthProvider[] = providerOrder.filter((provider) =>
        connectedProviders.has(provider),
    );
    if (orderedProviders.length === 0) {
        orderedProviders.push(primaryProvider);
    }

    return {
        provider: primaryProvider,
        hasPassword,
        connectedProviders: orderedProviders,
    };
}

function isBaseRole(value: string | undefined): value is BaseRole {
    return Boolean(value && BASE_ROLES.includes(value as BaseRole));
}

function isAccountStatus(value: string | undefined): value is AccountStatus {
    return Boolean(value && ACCOUNT_STATUSES.includes(value as AccountStatus));
}

function normalizeRoleContext(user: BetterAuthUserDocument): {
    baseRole: BaseRole;
    isAdmin: boolean;
    accountStatus: AccountStatus;
    roles: string[];
} {
    const baseRole = isBaseRole(user.baseRole) ? user.baseRole : "student";
    const isAdmin = Boolean(user.isAdmin);
    const accountStatus = isAccountStatus(user.accountStatus) ? user.accountStatus : "active";
    const roles = isAdmin ? [baseRole, "admin"] : [baseRole];
    return { baseRole, isAdmin, accountStatus, roles };
}

export function toUserDTO(user: BetterAuthUserDocument, accounts: BetterAuthAccountDocument[]): UserDTO {
    const roleContext = normalizeRoleContext(user);
    const authCapabilities = buildAuthCapabilities(accounts);
    const firstName = user.firstName?.trim();
    const lastName = user.lastName?.trim();
    const derivedFirstName = !firstName && user.name ? user.name.trim().split(/\s+/)[0] : undefined;
    const derivedLastName =
        !lastName && user.name
            ? user
                  .name.trim()
                  .split(/\s+/)
                  .slice(1)
                  .join(" ") || undefined
            : undefined;
    return {
        id: user._id.toString(),
        email: user.email,
        emailVerified: Boolean(user.emailVerifiedAt),
        firstName: firstName || derivedFirstName,
        lastName: lastName || derivedLastName,
        displayName: user.name ?? "User",
        avatarUrl: user.image,
        isPremium: Boolean(user.isPremium),
        baseRole: roleContext.baseRole,
        isAdmin: roleContext.isAdmin,
        accountStatus: roleContext.accountStatus,
        roles: roleContext.roles,
        provider: authCapabilities.provider,
        hasPassword: authCapabilities.hasPassword,
        connectedProviders: authCapabilities.connectedProviders,
    };
}

export function toPublicUserSummary(user: UserDTO): PublicUserSummaryDTO {
    return {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isPremium: user.isPremium,
        baseRole: user.baseRole,
        isAdmin: user.isAdmin,
        accountStatus: user.accountStatus,
        roles: user.roles,
    };
}

export class UserService {
    constructor(private rabbit: RabbitMqClient | null = null) {}

    setRabbitClient(client: RabbitMqClient): void {
        this.rabbit = client;
    }

    async getVerificationState(userId: string): Promise<{ requiresEmailVerification: boolean; email?: string }> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }

        const user = await db
            .collection<BetterAuthUserDocument>("users")
            .findOne({ _id: new mongoose.Types.ObjectId(userId) }, { projection: { email: 1, emailVerifiedAt: 1 } });
        if (!user) {
            throw new NotFoundError("User not found");
        }

        return {
            requiresEmailVerification: !Boolean(user.emailVerifiedAt),
            email: user.email,
        };
    }

    async getById(userId: string): Promise<UserDTO> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }

        console.log("getting user from database", userId);

        const user = await db
            .collection<BetterAuthUserDocument>("users")
            .findOne({ _id: new mongoose.Types.ObjectId(userId) });
        if (!user) {
            console.log("user not found", userId);
            throw new NotFoundError("User not found");
        }

        const accounts = await db
            .collection<BetterAuthAccountDocument>("auth_accounts")
            .find({ userId })
            .sort({ createdAt: 1 })
            .toArray();

        return toUserDTO(user, accounts);
    }

    async resolvePublicByIds(userIds: string[]): Promise<PublicUserSummaryDTO[]> {
        const cleanedIds = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))];
        if (cleanedIds.length === 0) {
            return [];
        }

        const validIds = cleanedIds.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
        if (validIds.length === 0) {
            return [];
        }

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }

        const objectIds = validIds.map((id) => new mongoose.Types.ObjectId(id));
        const users = await db
            .collection<BetterAuthUserDocument>("users")
            .find({ _id: { $in: objectIds } })
            .toArray();

        const accounts = await db
            .collection<BetterAuthAccountDocument>("auth_accounts")
            .find({ userId: { $in: validIds } })
            .sort({ createdAt: 1 })
            .toArray();
        const accountsByUserId = new Map<string, BetterAuthAccountDocument[]>();
        for (const account of accounts) {
            const existing = accountsByUserId.get(account.userId) ?? [];
            existing.push(account);
            accountsByUserId.set(account.userId, existing);
        }

        return users.map((user) => {
            const dto = toUserDTO(user, accountsByUserId.get(user._id.toString()) ?? []);
            return toPublicUserSummary(dto);
        });
    }

    async getOwnProfile(userId: string): Promise<{ phone?: string; location?: string }> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }
        const user = await db
            .collection<BetterAuthUserDocument>("users")
            .findOne(
                { _id: new mongoose.Types.ObjectId(userId) },
                { projection: { phone: 1, location: 1 } },
            );
        if (!user) {
            throw new NotFoundError("User not found");
        }
        return {
            phone: user.phone?.trim() || undefined,
            location: user.location?.trim() || undefined,
        };
    }

    async updateOwnProfile(userId: string, payload: UpdateOwnProfileRequest): Promise<{ phone?: string; location?: string }> {
        const phone = payload.profile?.phone?.trim();
        const location = payload.profile?.location?.trim();
        if (phone && phone.length > 40) {
            throw new BadRequestError("Phone number cannot exceed 40 characters.");
        }
        if (location && location.length > 120) {
            throw new BadRequestError("Location cannot exceed 120 characters.");
        }

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }

        const result = await db.collection<BetterAuthUserDocument>("users").updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            {
                $set: {
                    phone: phone || undefined,
                    location: location || undefined,
                    updatedAt: new Date(),
                },
            },
        );
        if (result.matchedCount === 0) {
            throw new NotFoundError("User not found");
        }

        return {
            phone: phone || undefined,
            location: location || undefined,
        };
    }

    async updateOwnAccount(
        userId: string,
        payload: UpdateOwnAccountRequest,
    ): Promise<{ user: UserDTO; requiresEmailVerification: boolean }> {
        const firstName = payload.firstName?.trim();
        const lastName = payload.lastName?.trim();
        const email = payload.email?.trim().toLowerCase();

        if (!firstName || firstName.length < 2 || firstName.length > 40) {
            throw new BadRequestError("First name must be between 2 and 40 characters.");
        }
        if (!lastName || lastName.length < 2 || lastName.length > 40) {
            throw new BadRequestError("Last name must be between 2 and 40 characters.");
        }
        if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new BadRequestError("A valid email is required.");
        }

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }

        const user = await db
            .collection<BetterAuthUserDocument>("users")
            .findOne({ _id: new mongoose.Types.ObjectId(userId) }, { projection: { email: 1 } });
        if (!user) {
            throw new NotFoundError("User not found");
        }

        const currentEmail = user.email?.trim().toLowerCase();
        const emailChanged = currentEmail !== email;
        const displayName = `${firstName} ${lastName}`.trim();

        try {
            const result = await db.collection<BetterAuthUserDocument>("users").updateOne(
                { _id: new mongoose.Types.ObjectId(userId) },
                {
                    $set: {
                        firstName,
                        lastName,
                        name: displayName,
                        email,
                        ...(emailChanged ? { emailVerifiedAt: null, emailVerified: false } : {}),
                        updatedAt: new Date(),
                    },
                },
            );
            if (result.matchedCount === 0) {
                throw new NotFoundError("User not found");
            }
        } catch (error) {
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                (error as { code?: number }).code === 11000
            ) {
                throw new BadRequestError("Email is already in use.");
            }
            throw error;
        }

        if (emailChanged) {
            await db.collection("auth_email_otps").deleteMany({ userId, purpose: "email_verification" });
        }

        const updatedUser = await this.getById(userId);
        await this.publishUserProfileUpserted(updatedUser);
        return {
            user: updatedUser,
            requiresEmailVerification: emailChanged,
        };
    }

    async listUsers(limit = 100): Promise<AdminUsersListResponse> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }
        const safeLimit = Math.max(1, Math.min(250, limit));
        const users = await db
            .collection<BetterAuthUserDocument>("users")
            .find({})
            .sort({ createdAt: -1 })
            .limit(safeLimit)
            .toArray();
        const userIds = users.map((user) => user._id.toString());
        const accounts = await db
            .collection<BetterAuthAccountDocument>("auth_accounts")
            .find({ userId: { $in: userIds } })
            .sort({ createdAt: 1 })
            .toArray();
        const accountsByUserId = new Map<string, BetterAuthAccountDocument[]>();
        for (const account of accounts) {
            const existing = accountsByUserId.get(account.userId) ?? [];
            existing.push(account);
            accountsByUserId.set(account.userId, existing);
        }
        return {
            users: users.map((user) => toUserDTO(user, accountsByUserId.get(user._id.toString()) ?? [])),
        };
    }

    async updateAccountStatus(targetUserId: string, status: AccountStatus): Promise<UserDTO> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }
        const _id = new mongoose.Types.ObjectId(targetUserId);
        const now = new Date();
        await db.collection<BetterAuthUserDocument>("users").updateOne(
            { _id },
            {
                $set: {
                    accountStatus: status,
                    updatedAt: now,
                },
            },
        );
        if (status === "banned") {
            await db.collection("auth_sessions").deleteMany({ userId: targetUserId });
        }
        const user = await this.getById(targetUserId);
        await this.publishUserProfileUpserted(user);
        return user;
    }

    async setEmailVerification(targetUserId: string, emailVerified: boolean): Promise<UserDTO> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }
        const _id = new mongoose.Types.ObjectId(targetUserId);
        const now = new Date();
        await db.collection<BetterAuthUserDocument>("users").updateOne(
            { _id },
            {
                $set: {
                    emailVerifiedAt: emailVerified ? now : null,
                    emailVerified,
                    updatedAt: now,
                },
            },
        );
        const user = await this.getById(targetUserId);
        await this.publishUserProfileUpserted(user);
        return user;
    }

    async setBaseRole(targetUserId: string, baseRole: BaseRole): Promise<UserDTO> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }
        await db.collection<BetterAuthUserDocument>("users").updateOne(
            { _id: new mongoose.Types.ObjectId(targetUserId) },
            {
                $set: {
                    baseRole,
                    updatedAt: new Date(),
                },
            },
        );
        const user = await this.getById(targetUserId);
        await this.publishUserProfileUpserted(user);
        return user;
    }

    async setAdminElevation(targetUserId: string, isAdmin: boolean): Promise<UserDTO> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }
        await db.collection<BetterAuthUserDocument>("users").updateOne(
            { _id: new mongoose.Types.ObjectId(targetUserId) },
            {
                $set: {
                    isAdmin,
                    updatedAt: new Date(),
                },
            },
        );
        const user = await this.getById(targetUserId);
        await this.publishUserProfileUpserted(user);
        return user;
    }

    async getAdminOverviewStats(): Promise<UsersAdminOverviewStatsResponse> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }
        const col = db.collection<BetterAuthUserDocument & { createdAt?: Date }>("users");
        const growthStart = overviewGrowthStartDate();

        const [total, roleRows, verified, banned, admins, dayRows] = await Promise.all([
            col.countDocuments({}),
            col
                .aggregate<{ _id: string; count: number }>([
                    { $group: { _id: { $ifNull: ["$baseRole", "student"] }, count: { $sum: 1 } } },
                ])
                .toArray(),
            col.countDocuments({
                $or: [{ emailVerified: true }, { emailVerifiedAt: { $ne: null } }],
            }),
            col.countDocuments({ accountStatus: "banned" }),
            col.countDocuments({ isAdmin: true }),
            col
                .aggregate<{ _id: string; count: number }>([
                    { $match: { createdAt: { $gte: growthStart } } },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 } },
                ])
                .toArray(),
        ]);

        const byBaseRole = Object.fromEntries(roleRows.map((row) => [String(row._id), row.count]));
        for (const role of BASE_ROLES) {
            if (byBaseRole[role] === undefined) {
                byBaseRole[role] = 0;
            }
        }

        return {
            total,
            byBaseRole,
            verified,
            unverified: Math.max(0, total - verified),
            banned,
            admins,
            byDay: fillDailyCounts(dayRows.map((row) => ({ date: String(row._id), count: row.count }))),
        };
    }

    async deleteUser(targetUserId: string): Promise<void> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }
        const _id = new mongoose.Types.ObjectId(targetUserId);
        await Promise.all([
            db.collection<BetterAuthUserDocument>("users").deleteOne({ _id }),
            db.collection("auth_accounts").deleteMany({ userId: targetUserId }),
            db.collection("auth_sessions").deleteMany({ userId: targetUserId }),
            db.collection("auth_verifications").deleteMany({ identifier: targetUserId }),
        ]);
    }

    async publishUserProfileUpserted(user: UserDTO): Promise<void> {
        if (!this.rabbit) return;
        const event: UserProfileUpsertedEvent = {
            eventId: randomUUID(),
            eventName: "users.profile.upserted",
            schemaVersion: 1,
            occurredAtIso: new Date().toISOString(),
            profile: {
                userId: user.id,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                isPremium: user.isPremium,
                roles: user.roles,
            },
        };
        this.rabbit.publishJsonTo(USERS_EXCHANGE, ROUTING_KEY_USERS_PROFILE_UPSERTED, event, {
            idempotencyKey: event.eventId,
        });
    }
}
