import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { MatchingService } from "../services/matching.service.js";
import { AiClient } from "../services/ai.client.js";

const matchingService = new MatchingService();
const ai = new AiClient();

export const matchingController = new Hono();

function uid(c: any): string {
    const id = c.get("userId") as string | undefined;
    if (!id) throw Object.assign(new Error("Unauthorized"), { status: 401 });
    return id;
}

matchingController.get("/offre/:id", async (c) => {
    const userId = uid(c);
    const offreId = c.req.param("id");
    const matching = await matchingService.get(userId, offreId);
    return c.json({ matching });
});

matchingController.post(
    "/offre/:id",
    zValidator("json", z.object({ userProfile: z.any() })),
    async (c) => {
        const userId = uid(c);
        const offreId = c.req.param("id");
        const { userProfile } = c.req.valid("json");
        const result = await matchingService.compute(userId, offreId, userProfile);
        return c.json({ matching: result });
    },
);

matchingController.get("/top", async (c) => {
    return c.json({ error: "Use POST /matching/top" }, 405);
});

matchingController.post(
    "/top",
    zValidator("json", z.object({ userProfile: z.any(), limit: z.number().min(1).max(10).default(3) })),
    async (c) => {
        const userId = uid(c);
        const { userProfile, limit } = c.req.valid("json");
        const matches = await matchingService.getTopMatchesForUser(userId, userProfile, limit);
        return c.json({ matches });
    },
);

matchingController.post(
    "/cv-improvements",
    zValidator("json", z.object({ cvText: z.string().optional().default("Profil générique"), offreId: z.string() })),
    async (c) => {
        const { cvText, offreId } = c.req.valid("json");
        const offre = await import("../models/Offre.model.js").then((m) => m.OffreModel.findById(offreId).lean());
        if (!offre) return c.json({ error: "Offre not found" }, 404);

        const offreText = `${offre.titre}\n${offre.description ?? ""}\nCompétences: ${offre.competences?.join(", ")}`;
        const result = await ai.suggestCvImprovements(cvText, offreText);
        return c.json(result);
    },
);