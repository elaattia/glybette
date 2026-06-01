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
};

type BetterAuthAccountDocument = {
    userId: string;
    providerId?: string;
};

function isAuthProvider(value: string | undefined): value is AuthProvider {
    return Boolean(value && AUTH_PROVIDERS.includes(value as AuthProvider));
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

export function toUserDTO(user: BetterAuthUserDocument, account: BetterAuthAccountDocument | null): UserDTO {
    const roleContext = normalizeRoleContext(user);
    return {
        id: user._id.toString(),
        email: user.email,
        emailVerified: Boolean(user.emailVerifiedAt),
        displayName: user.name ?? "User",
        avatarUrl: user.image,
        isPremium: Boolean(user.isPremium),
        baseRole: roleContext.baseRole,
        isAdmin: roleContext.isAdmin,
        accountStatus: roleContext.accountStatus,
        roles: roleContext.roles,
        provider: isAuthProvider(account?.providerId) ? account.providerId : "google",
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

        const account = await db
            .collection<BetterAuthAccountDocument>("auth_accounts")
            .findOne({ userId }, { sort: { createdAt: 1 } });

        return toUserDTO(user, account);
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
        const accountByUserId = new Map<string, BetterAuthAccountDocument>();
        for (const account of accounts) {
            if (!accountByUserId.has(account.userId)) {
                accountByUserId.set(account.userId, account);
            }
        }

        return users.map((user) => {
            const dto = toUserDTO(user, accountByUserId.get(user._id.toString()) ?? null);
            return toPublicUserSummary(dto);
        });
    }

    async updateOwnProfile(userId: string, payload: UpdateOwnProfileRequest): Promise<UserDTO> {
        const displayName = payload.displayName?.trim();
        const avatarUrl = payload.avatarUrl?.trim();
        if (!displayName || displayName.length < 2) {
            throw new BadRequestError("Display name must be at least 2 characters.");
        }
        if (displayName.length > 80) {
            throw new BadRequestError("Display name cannot exceed 80 characters.");
        }
        if (avatarUrl && avatarUrl.length > 1000) {
            throw new BadRequestError("Avatar URL is too long.");
        }

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }

        await db.collection<BetterAuthUserDocument>("users").updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            {
                $set: {
                    name: displayName,
                    image: avatarUrl || undefined,
                    updatedAt: new Date(),
                },
            },
        );

        const user = await this.getById(userId);
        await this.publishUserProfileUpserted(user);
        return user;
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
        const accountByUserId = new Map<string, BetterAuthAccountDocument>();
        for (const account of accounts) {
            if (!accountByUserId.has(account.userId)) {
                accountByUserId.set(account.userId, account);
            }
        }
        return {
            users: users.map((user) => toUserDTO(user, accountByUserId.get(user._id.toString()) ?? null)),
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
