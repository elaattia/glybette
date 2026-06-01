import crypto from "node:crypto";
import mongoose from "mongoose";
import { OffreModel } from "../models/Offre.model.js";

type SourceOffre = {
    _id?: unknown;
    hash_unique?: unknown;
    titre?: unknown;
    lien_original?: unknown;
    lien?: unknown;
    status?: unknown;
    date_scraped?: unknown;
    date_publication?: unknown;
    nb_vues?: unknown;
    nb_clics?: unknown;
    [key: string]: unknown;
};

function toSafeString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeDate(value: unknown): Date {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }
    if (typeof value === "string" || typeof value === "number") {
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date();
}

function computeFallbackHash(doc: SourceOffre): string {
    const titre = toSafeString(doc.titre).toLowerCase();
    const lien = toSafeString(doc.lien_original || doc.lien).toLowerCase();
    const raw = `${titre}|${lien}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
}

function toFiniteNumber(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

export async function bootstrapOffresFromScrapingDb(): Promise<void> {
    const enabled = process.env.JOBS_BOOTSTRAP_FROM_SCRAPING !== "false";
    if (!enabled) return;

    const targetCount = await OffreModel.countDocuments({});
    if (targetCount > 0) {
        return;
    }

    const connectionDb = mongoose.connection.db;
    if (!connectionDb) {
        console.warn("[jobs-service] Bootstrap skipped: Mongo connection has no selected DB");
        return;
    }

    const scrapingDbName = process.env.SCRAPING_MONGODB_NAME || "glybette";
    const sourceDb = mongoose.connection.getClient().db(scrapingDbName);
    const sourceCollection = sourceDb.collection<SourceOffre>("offres");

    const sourceCount = await sourceCollection.countDocuments({ status: "active" });
    if (sourceCount === 0) {
        console.log("[jobs-service] Bootstrap skipped: no active legacy offers found");
        return;
    }

    console.log(
        `[jobs-service] Bootstrapping offers from scraping DB "${scrapingDbName}" (${sourceCount} active docs)`,
    );

    const cursor = sourceCollection.find({ status: "active" });
    const BATCH_SIZE = 500;
    let insertedOrUpdated = 0;
    let skipped = 0;
    let ops: Array<{
        updateOne: {
            filter: Record<string, unknown>;
            update: Record<string, unknown>;
            upsert: boolean;
        };
    }> = [];

    for await (const doc of cursor) {
        const titre = toSafeString(doc.titre);
        const lienOriginal = toSafeString(doc.lien_original || doc.lien);
        if (!titre || !lienOriginal) {
            skipped++;
            continue;
        }

        const hashUnique = toSafeString(doc.hash_unique) || computeFallbackHash(doc);
        const { _id: _legacyId, nb_vues: _legacyViews, nb_clics: _legacyClicks, ...rest } = doc;

        const normalized = {
            ...rest,
            hash_unique: hashUnique,
            titre,
            lien_original: lienOriginal,
            status: "active",
            date_scraped: normalizeDate(doc.date_scraped),
            date_publication: doc.date_publication ? normalizeDate(doc.date_publication) : undefined,
            date_updated: new Date(),
        };

        ops.push({
            updateOne: {
                filter: { hash_unique: hashUnique },
                update: {
                    $set: normalized,
                    $setOnInsert: {
                        nb_vues: toFiniteNumber(doc.nb_vues),
                        nb_clics: toFiniteNumber(doc.nb_clics),
                    },
                },
                upsert: true,
            },
        });

        if (ops.length >= BATCH_SIZE) {
            const result = await OffreModel.bulkWrite(ops, { ordered: false });
            insertedOrUpdated += result.upsertedCount + result.modifiedCount;
            ops = [];
        }
    }

    if (ops.length > 0) {
        const result = await OffreModel.bulkWrite(ops, { ordered: false });
        insertedOrUpdated += result.upsertedCount + result.modifiedCount;
    }

    const finalCount = await OffreModel.countDocuments({});
    console.log(
        `[jobs-service] Bootstrap complete: upserted=${insertedOrUpdated}, skipped=${skipped}, finalCount=${finalCount}`,
    );
}
