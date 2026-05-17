import amqp, {
    type Channel,
    type Connection,
    type ConsumeMessage,
} from "amqplib";
import { z } from "zod";

import { OffreModel } from "../models/Offre.model.js";
import { loadEnv } from "../config/env.js";

const env = loadEnv();

const QUEUE = "jobs.offres";
const EXCHANGE = "jobs";
const ROUTING_KEY = "offre.scraped";
const RECONNECT_DELAY_MS = 5000;
const MAX_RECONNECT_DELAY_MS = 30000;
const PREFETCH = 10;

const OffreMessageSchema = z.object({
    hash_unique: z.string().min(1, "hash_unique is required"),
    titre: z.string(),
    entreprise: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    competences: z.array(z.string()).optional(),
    localisation: z.string().nullable().optional(),
    salaire: z.string().nullable().optional(),
    type_contrat: z.string().nullable().optional(),
    lien_original: z.string().optional(),
    lien: z.string().nullable().optional(),
    lien_image: z.string().nullable().optional(),
    type_offre: z.string().optional(),
    domaine: z.string().nullable().optional(),
    source_site: z.string().optional(),
    company_about: z.string().nullable().optional(),
    niveau_experience: z.string().nullable().optional(),
    taille_entreprise: z.string().nullable().optional(),
    teletravail: z.string().nullable().optional(),
    nb_candidats: z.string().nullable().optional(),
    site_web_entreprise: z.string().nullable().optional(),
    email_contact: z.string().nullable().optional(),
    telephone: z.string().nullable().optional(),
    categories: z.union([z.string(), z.array(z.string())]).nullable().optional(),
    nb_sujets: z.union([z.string(), z.number()]).nullable().optional(),
    date_publication: z.string().nullable().optional(),
    date_scraped: z.string().nullable().optional(),
});

let isConsuming = false;
let reconnectAttempts = 0;

export async function startOffreConsumer() {
    if (isConsuming) return;
    isConsuming = true;
    console.log("[jobs-service]  Starting RabbitMQ consumer...");
    await connectWithRetry();
}

async function connectWithRetry() {
    while (true) {
        try {
            await connect();
            reconnectAttempts = 0;
            break;
        } catch (err) {
            reconnectAttempts++;
            const delay = Math.min(
                RECONNECT_DELAY_MS * Math.pow(1.5, Math.min(reconnectAttempts - 1, 6)),
                MAX_RECONNECT_DELAY_MS,
            );
            console.error(
                `[jobs-service] RabbitMQ connection failed (attempt ${reconnectAttempts}), ` +
                `retrying in ${Math.round(delay / 1000)}s:`,
                err instanceof Error ? err.message : err,
            );
            await sleep(delay);
        }
    }
}

async function connect(): Promise<void> {
    const connection = await amqp.connect(env.RABBITMQ_URL);

    console.log("[jobs-service]  RabbitMQ connected");

    connection.on("error", (err) => {
        console.error("[jobs-service] RabbitMQ connection error:", err.message);
    });

    connection.on("close", async () => {
        console.warn("[jobs-service] RabbitMQ connection closed, reconnecting...");
        await sleep(RECONNECT_DELAY_MS);
        await connectWithRetry();
    });

    const channel: Channel = await connection.createChannel();

    await channel.prefetch(PREFETCH);

    await channel.assertExchange(EXCHANGE, "topic", { durable: true });
    await channel.assertExchange(`${EXCHANGE}.dlx`, "topic", { durable: true });

    await channel.assertQueue(`${QUEUE}.dlq`, {
        durable: true,
        arguments: {
            "x-message-ttl": 86_400_000,
        },
    });

    await channel.bindQueue(
        `${QUEUE}.dlq`,
        `${EXCHANGE}.dlx`,
        ROUTING_KEY
    );

    await channel.assertQueue(QUEUE, {
        durable: true,
        arguments: {
            "x-dead-letter-exchange": `${EXCHANGE}.dlx`,
            "x-dead-letter-routing-key": ROUTING_KEY,
            "x-message-ttl": 3_600_000,
        },
    });

    await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

    await channel.consume(QUEUE, async (msg) => {
        if (!msg) return;

        try {
            const raw = msg.content.toString("utf8");
            const parsed = JSON.parse(raw);

            const offreData = OffreMessageSchema.parse(parsed);

            await upsertOffre(offreData);

            channel.ack(msg);

            console.log(
                `[jobs-service]  Message processed: ${parsed.titre}`
            );

        } catch (err) {
            console.error("[jobs-service] Error processing message:", err);
            channel.nack(msg, false, false);
        }
    });

    const queueInfo = await channel.checkQueue(QUEUE);

    console.log(
        `[jobs-service]  Consumer active on ${QUEUE} ` +
        `(${queueInfo.consumerCount} consumers)`
    );
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function upsertOffre(data: Record<string, unknown>) {
    const hash = data.hash_unique as string | undefined;
    if (!hash) {
        console.warn("[jobs-service] Skipping offer without hash_unique");
        return;
    }

    const toDate = (v: unknown): Date | undefined => {
        if (!v) return undefined;
        if (v instanceof Date) return v;
        if (typeof v === "string" || typeof v === "number") {
            const d = new Date(v);
            return isNaN(d.getTime()) ? undefined : d;
        }
        return undefined;
    };

    const setFields: Record<string, unknown> = {
        hash_unique: hash,
        titre: data.titre ?? "",
        entreprise: data.entreprise ?? null,
        description: data.description ?? null,
        competences: Array.isArray(data.competences) ? data.competences : [],
        localisation: data.localisation ?? null,
        salaire: data.salaire ?? null,
        type_contrat: data.type_contrat ?? null,
        lien_original: data.lien_original ?? data.lien ?? "",
        lien_image: data.lien_image ?? null,
        type_offre: data.type_offre ?? "emploi",
        domaine: data.domaine ?? null,
        source_site: data.source_site ?? "",
        company_about: data.company_about ?? null,
        niveau_experience: data.niveau_experience ?? null,
        taille_entreprise: data.taille_entreprise ?? null,
        teletravail: data.teletravail ?? null,
        nb_candidats: data.nb_candidats ?? null,
        site_web_entreprise: data.site_web_entreprise ?? null,
        email_contact: data.email_contact ?? null,
        telephone: data.telephone ?? null,
        categories: data.categories ?? null,
        nb_sujets: data.nb_sujets ?? null,
        status: "active",
        date_updated: new Date(),
    };

    const datePub = toDate(data.date_publication);
    if (datePub) setFields.date_publication = datePub;

    const dateScraped = toDate(data.date_scraped);
    setFields.date_scraped = dateScraped ?? new Date();

    try {
        const existing = await OffreModel.findOne({ hash_unique: hash }).lean();

        const result = await OffreModel.findOneAndUpdate(
            { hash_unique: hash },
            {
                $set: setFields,
                $setOnInsert: {
                    nb_vues: 0,
                    nb_clics: 0,
                },
            },
            { upsert: true, new: true },
        );

        const action = existing ? "updated" : "inserted";
        if (action === "inserted") {
            console.log(`[jobs-service]  New offer ${action}: "${data.titre ?? hash}" (${data.source_site})`);
        }
    } catch (err: any) {
        if (err?.code !== 11000) {
            console.error("[jobs-service] MongoDB upsert error:", err);
        }
    }
}