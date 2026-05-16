import mongoose from "mongoose";
import {
    AUTH_PROVIDERS,
    type AuthProvider,
    type PublicUserSummaryDTO,
    type UpdateOwnProfileRequest,
    type UserDTO,
} from "@glybette/contracts";
import {
    ROUTING_KEY_USERS_PROFILE_UPSERTED,
    USERS_EXCHANGE,
    type RabbitMqClient,
    type UserProfileUpsertedEvent,
} from "@glybette/messaging";
import { BadRequestError, NotFoundError } from "@glybette/utils";
import { randomUUID } from "node:crypto";

type BetterAuthUserDocument = mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    email?: string;
    emailVerifiedAt?: Date | null;
    name?: string;
    image?: string;
    isPremium?: boolean;
};

type BetterAuthAccountDocument = {
    userId: string;
    providerId?: string;
};

function isAuthProvider(value: string | undefined): value is AuthProvider {
    return Boolean(value && AUTH_PROVIDERS.includes(value as AuthProvider));
}

export function toUserDTO(user: BetterAuthUserDocument, account: BetterAuthAccountDocument | null): UserDTO {
    return {
        id: user._id.toString(),
        email: user.email,
        emailVerified: Boolean(user.emailVerifiedAt),
        displayName: user.name ?? "User",
        avatarUrl: user.image,
        isPremium: Boolean(user.isPremium),
        roles: ["user"],
        provider: isAuthProvider(account?.providerId) ? account.providerId : "google",
    };
}

export function toPublicUserSummary(user: UserDTO): PublicUserSummaryDTO {
    return {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isPremium: user.isPremium,
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
