import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { CoverLetterService } from "../services/cover-letter.service.js";
import { OffreModel } from "../models/Offre.model.js";

const coverLetterService = new CoverLetterService();
export const coverLetterController = new Hono();

coverLetterController.post(
    "/generate",
    zValidator(
        "json",
        z.object({
            cvText: z.string().optional().default("Profil générique"),
            offreId: z.string(),
            tone: z.enum(["professional", "enthusiastic", "concise"]).default("professional"),
            userAchievements: z.array(z.string()).default([]),
        }),
    ),
    async (c) => {
        const { cvText, offreId, tone, userAchievements } = c.req.valid("json");
        const offre = await OffreModel.findById(offreId).lean();
        if (!offre) return c.json({ error: "Offre not found" }, 404);

        const offreText = `${offre.titre} chez ${offre.entreprise ?? "l'entreprise"}\n${offre.description ?? ""}`;
        const result = await coverLetterService.generate({ cvText, offreText, tone, userAchievements });
        return c.json(result);
    },
);

coverLetterController.post(
    "/refine",
    zValidator(
        "json",
        z.object({
            currentLetter: z.string().min(1),
            feedback: z.string().min(1),
            offreId: z.string(),
        }),
    ),
    async (c) => {
        const { currentLetter, feedback, offreId } = c.req.valid("json");
        const offre = await OffreModel.findById(offreId).lean();
        if (!offre) return c.json({ error: "Offre not found" }, 404);
        const offreText = `${offre.titre}\n${offre.description ?? ""}`;
        const result = await coverLetterService.refine({ currentLetter, feedback, offreText });
        return c.json(result);
    },
);