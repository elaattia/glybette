import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import type {
    AdminPortfolioDocumentDTO,
    ContentAdminOverviewStatsResponse,
    PortfolioDocumentDTO,
    PortfolioResponse,
    PortfolioSlugAvailabilityResponse,
    PublicUserSummaryDTO,
    PublicPortfolioResponse,
    SavePortfolioRequest,
} from "@glybette/contracts";
import { BadRequestError, NotFoundError, ServiceUnavailableError, fillDailyCounts, overviewGrowthStartDate } from "@glybette/utils";
import type { UserProfileUpsertedEvent } from "@glybette/messaging";
import { validatePortfolioSlug } from "./portfolio.validation.js";

type PortfolioDocument = {
    _id: mongoose.Types.ObjectId;
    userId: string;
    slug: string;
    identity?: SavePortfolioRequest["identity"];
    templateId: SavePortfolioRequest["templateId"];
    style: SavePortfolioRequest["style"];
    tabs: SavePortfolioRequest["tabs"];
    branding: {
        poweredBy: "GLYBETTE";
        locked: true;
    };
    createdAt: Date;
    updatedAt: Date;
};

type UserProfileSnapshotDocument = {
    _id: mongoose.Types.ObjectId;
    userId: string;
    displayName: string;
    avatarUrl?: string;
    isPremium: boolean;
    roles: string[];
    sourceUpdatedAt: Date;
    updatedAt: Date;
};

const DEFAULT_STYLE: SavePortfolioRequest["style"] = {
    theme: "dark",
    accentColor: "#16A34A",
    fontFamily: "DM Sans",
    radius: "soft",
};

function createIdentityFromSlug(slug: string): SavePortfolioRequest["identity"] {
    return {
        displayName:
            slug
                .split("-")
                .filter(Boolean)
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ") || "Your Name",
        eyebrowText: "Independent portfolio",
        eyebrowPlacement: "above",
    };
}

function now() {
    return new Date();
}

function createStarterPortfolio(userId: string, slug: string): PortfolioDocument {
    const timestamp = now();

    return {
        _id: new mongoose.Types.ObjectId(),
        userId,
        slug,
        identity: createIdentityFromSlug(slug),
        templateId: "atelier",
        style: DEFAULT_STYLE,
        tabs: [
            {
                id: randomUUID(),
                label: "About",
                slug: "about",
                blocks: [
                    {
                        id: randomUUID(),
                        type: "markdown",
                        title: "About me",
                        grid: { column: 1, row: 1, columnSpan: 2, rowSpan: 1 },
                        source: { kind: "manual" },
                        data: {
                            markdown:
                                "Tell visitors who you are, what you build, and what kind of work you are looking for.",
                        },
                    },
                ],
            },
        ],
        branding: {
            poweredBy: "GLYBETTE",
            locked: true,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}

function toDTO(document: PortfolioDocument): PortfolioDocumentDTO {
    return {
        id: document._id.toString(),
        userId: document.userId,
        slug: document.slug,
        identity: document.identity ?? createIdentityFromSlug(document.slug),
        templateId: document.templateId,
        style: document.style,
        tabs: document.tabs,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
    };
}

function toOwnerSummary(document: UserProfileSnapshotDocument): PublicUserSummaryDTO {
    const isAdmin = document.roles.includes("admin");
    const baseRole = document.roles.includes("enterprise") ? "enterprise" : "student";
    return {
        id: document.userId,
        displayName: document.displayName,
        avatarUrl: document.avatarUrl,
        isPremium: document.isPremium,
        baseRole,
        isAdmin,
        accountStatus: "active",
        roles: document.roles,
    };
}

export class PortfolioService {
    constructor(private readonly resolveUsers?: (userIds: string[]) => Promise<PublicUserSummaryDTO[]>) {}

    private collection() {
        const db = mongoose.connection.db;
        if (!db) {
            throw new ServiceUnavailableError("Portfolio database is not initialized");
        }
        return db.collection<PortfolioDocument>("portfolios");
    }

    private userProfilesCollection() {
        const db = mongoose.connection.db;
        if (!db) {
            throw new ServiceUnavailableError("Portfolio database is not initialized");
        }
        return db.collection<UserProfileSnapshotDocument>("portfolio_user_profiles");
    }

    async ensureIndexes(): Promise<void> {
        const collection = this.collection();
        await collection.createIndex({ slug: 1 }, { unique: true });
        await collection.createIndex({ userId: 1 }, { unique: true });
        await collection.createIndex({ updatedAt: -1 });
        await this.userProfilesCollection().createIndexes([{ key: { userId: 1 }, unique: true }, { key: { updatedAt: -1 } }]);
    }

    async applyUserProfileUpsertedEvent(event: UserProfileUpsertedEvent): Promise<void> {
        const sourceUpdatedAt = new Date(event.occurredAtIso);
        const profile = event.profile;
        await this.userProfilesCollection().updateOne(
            {
                userId: profile.userId,
                $or: [{ sourceUpdatedAt: { $exists: false } }, { sourceUpdatedAt: { $lte: sourceUpdatedAt } }],
            },
            {
                $set: {
                    displayName: profile.displayName,
                    avatarUrl: profile.avatarUrl,
                    isPremium: profile.isPremium,
                    roles: profile.roles,
                    sourceUpdatedAt,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    _id: new mongoose.Types.ObjectId(),
                    userId: profile.userId,
                },
            },
            { upsert: true },
        );
    }

    async getCurrent(userId: string): Promise<PortfolioResponse> {
        const portfolio = await this.collection().findOne({ userId });
        return {
            portfolio: portfolio ? toDTO(portfolio) : null,
        };
    }

    async checkSlugAvailability(rawSlug: string, userId?: string): Promise<PortfolioSlugAvailabilityResponse> {
        const slug = validatePortfolioSlug(rawSlug);
        const owner = await this.collection().findOne({ slug }, { projection: { userId: 1, slug: 1 } });

        return {
            slug,
            available: !owner || owner.userId === userId,
        };
    }

    async setSlug(userId: string, rawSlug: string): Promise<PortfolioResponse> {
        const slug = validatePortfolioSlug(rawSlug);
        await this.assertSlugAvailableForUser(slug, userId);

        const existing = await this.collection().findOne({ userId });
        if (!existing) {
            await this.collection().insertOne(createStarterPortfolio(userId, slug));
        } else {
            await this.collection().updateOne(
                { userId },
                {
                    $set: {
                        slug,
                        identity: existing.identity ?? createIdentityFromSlug(slug),
                        updatedAt: now(),
                    },
                },
            );
        }

        return this.getCurrent(userId);
    }

    async saveCurrent(userId: string, payload: SavePortfolioRequest): Promise<PortfolioResponse> {
        await this.assertSlugAvailableForUser(payload.slug, userId);
        const updatedAt = now();

        await this.collection().updateOne(
            { userId },
            {
                $set: {
                    slug: payload.slug,
                    identity: payload.identity,
                    templateId: payload.templateId,
                    style: payload.style,
                    tabs: payload.tabs,
                    branding: { poweredBy: "GLYBETTE", locked: true },
                    updatedAt,
                },
                $setOnInsert: {
                    userId,
                    createdAt: updatedAt,
                },
            },
            { upsert: true },
        );

        return this.getCurrent(userId);
    }

    async getPublicBySlug(rawSlug: string): Promise<PublicPortfolioResponse> {
        const slug = validatePortfolioSlug(rawSlug);
        const portfolio = await this.collection().findOne({ slug });
        if (!portfolio) {
            throw new NotFoundError("Portfolio not found");
        }

        return {
            portfolio: toDTO(portfolio),
        };
    }

    async getAdminOverviewStats(): Promise<ContentAdminOverviewStatsResponse> {
        const growthStart = overviewGrowthStartDate();
        const col = this.collection();

        const [total, dayRows] = await Promise.all([
            col.countDocuments({}),
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

        return {
            total,
            byDay: fillDailyCounts(dayRows.map((row) => ({ date: String(row._id), count: row.count }))),
        };
    }

    async adminList(limit = 100): Promise<AdminPortfolioDocumentDTO[]> {
        const safeLimit = Math.max(1, Math.min(250, limit));
        const portfolios = await this.collection().find({}).sort({ updatedAt: -1 }).limit(safeLimit).toArray();
        const owners = await this.getUserSummariesByIds(portfolios.map((portfolio) => portfolio.userId));
        return portfolios.map((portfolio) => ({
            ...toDTO(portfolio),
            owner: owners.get(portfolio.userId) ?? this.fallbackUserSummary(portfolio.userId),
        }));
    }

    async adminGetById(id: string): Promise<AdminPortfolioDocumentDTO> {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            throw new BadRequestError("Invalid portfolio id.");
        }
        const portfolio = await this.collection().findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (!portfolio) {
            throw new NotFoundError("Portfolio not found");
        }
        const owners = await this.getUserSummariesByIds([portfolio.userId]);
        return {
            ...toDTO(portfolio),
            owner: owners.get(portfolio.userId) ?? this.fallbackUserSummary(portfolio.userId),
        };
    }

    async adminDeleteById(id: string): Promise<{ ok: true }> {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            throw new BadRequestError("Invalid portfolio id.");
        }
        await this.collection().deleteOne({ _id: new mongoose.Types.ObjectId(id) });
        return { ok: true };
    }

    private async assertSlugAvailableForUser(slug: string, userId: string): Promise<void> {
        const existing = await this.collection().findOne({ slug }, { projection: { userId: 1 } });
        if (existing && existing.userId !== userId) {
            throw new BadRequestError("This portfolio URL name is already taken.");
        }
    }

    private async getUserSummariesByIds(userIds: string[]): Promise<Map<string, PublicUserSummaryDTO>> {
        const ids = [...new Set(userIds.map((id) => id?.trim()).filter(Boolean) as string[])];
        if (ids.length === 0) {
            return new Map();
        }

        const existing = await this.userProfilesCollection().find({ userId: { $in: ids } }).toArray();
        const result = new Map<string, PublicUserSummaryDTO>();
        for (const profile of existing) {
            result.set(profile.userId, toOwnerSummary(profile));
        }

        const missingIds = ids.filter((id) => !result.has(id));
        if (missingIds.length > 0 && this.resolveUsers) {
            const resolvedUsers = await this.resolveUsers(missingIds).catch(() => []);
            if (resolvedUsers.length > 0) {
                await Promise.all(
                    resolvedUsers.map((user) =>
                        this.userProfilesCollection().updateOne(
                            { userId: user.id },
                            {
                                $set: {
                                    displayName: user.displayName,
                                    avatarUrl: user.avatarUrl,
                                    isPremium: user.isPremium,
                                    roles: user.roles,
                                    updatedAt: new Date(),
                                },
                                $setOnInsert: {
                                    _id: new mongoose.Types.ObjectId(),
                                    userId: user.id,
                                    sourceUpdatedAt: new Date(),
                                },
                            },
                            { upsert: true },
                        ),
                    ),
                );
                for (const user of resolvedUsers) {
                    result.set(user.id, user);
                }
            }
        }

        return result;
    }

    private fallbackUserSummary(userId: string): PublicUserSummaryDTO {
        return {
            id: userId,
            displayName: "User",
            avatarUrl: undefined,
            isPremium: false,
            baseRole: "student",
            isAdmin: false,
            accountStatus: "active",
            roles: ["student"],
        };
    }
}
