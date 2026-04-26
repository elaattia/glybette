import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import type {
    PortfolioDocumentDTO,
    PortfolioResponse,
    PortfolioSlugAvailabilityResponse,
    PublicPortfolioResponse,
    SavePortfolioRequest,
} from "@glybette/contracts";
import { BadRequestError, NotFoundError, ServiceUnavailableError } from "@glybette/utils";
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

export class PortfolioService {
    private collection() {
        const db = mongoose.connection.db;
        if (!db) {
            throw new ServiceUnavailableError("Portfolio database is not initialized");
        }
        return db.collection<PortfolioDocument>("portfolios");
    }

    async ensureIndexes(): Promise<void> {
        const collection = this.collection();
        await collection.createIndex({ slug: 1 }, { unique: true });
        await collection.createIndex({ userId: 1 }, { unique: true });
        await collection.createIndex({ updatedAt: -1 });
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

    private async assertSlugAvailableForUser(slug: string, userId: string): Promise<void> {
        const existing = await this.collection().findOne({ slug }, { projection: { userId: 1 } });
        if (existing && existing.userId !== userId) {
            throw new BadRequestError("This portfolio URL name is already taken.");
        }
    }
}
