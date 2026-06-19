import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AiProvider } from "../lib/ai-provider.types.js";
import { CvAiService } from "../services/cv-ai.service.js";

export function createCvRoutes(provider: AiProvider): Hono {
    const svc = new CvAiService(provider);
    const cvRoutes = new Hono();

cvRoutes.post(
    "/ats-score-cv",
    zValidator(
        "json",
        z.object({
            cvText: z.string().min(1),
        }),
    ),
    async (c) => {
        const { cvText } = c.req.valid("json");
        const result = await svc.scoreAtsCvOnly(cvText);
        return c.json(result);
    },
);

cvRoutes.post(
    "/ats-score",
    zValidator(
        "json",
        z.object({
            cvText: z.string().min(1),
            jobDescription: z.string().min(1),
        }),
    ),
    async (c) => {
        const { cvText, jobDescription } = c.req.valid("json");
        const result = await svc.scoreAts(cvText, jobDescription);
        return c.json(result);
    },
);

cvRoutes.post(
    "/suggestions",
    zValidator(
        "json",
        z.object({
            cvText: z.string().min(1),
            targetRole: z.string().optional(),
        }),
    ),
    async (c) => {
        const { cvText } = c.req.valid("json");
        const result = await svc.suggestImprovements(cvText);
        return c.json(result);
    },
);

cvRoutes.post(
    "/enhance",
    zValidator(
        "json",
        z.object({
            text: z.string().min(1),
            sectionType: z.string(),
            jobTitle: z.string().optional(),
        }),
    ),
    async (c) => {
        const { text, sectionType, jobTitle } = c.req.valid("json");
        const result = await svc.enhanceText(text, sectionType, { jobTitle });
        return c.json(result);
    },
);

cvRoutes.post(
    "/tailor",
    zValidator(
        "json",
        z.object({
            cvText: z.string().min(1),
            jobDescription: z.string().min(1),
        }),
    ),
    async (c) => {
        const { cvText, jobDescription } = c.req.valid("json");
        const result = await svc.tailorCv(cvText, jobDescription);
        return c.json(result);
    },
);

cvRoutes.post(
    "/cover-letter",
    zValidator(
        "json",
        z.object({
            cvText: z.string().min(1),
            jobDescription: z.string().min(1),
            tone: z.enum(["professional", "enthusiastic", "concise"]).default("professional"),
        }),
    ),
    async (c) => {
        const { cvText, jobDescription, tone } = c.req.valid("json");
        const result = await svc.generateCoverLetter(cvText, jobDescription, tone);
        return c.json(result);
    },
);

cvRoutes.post("/extract", zValidator("json", z.object({ text: z.string().min(1) })), async (c) => {
    const { text } = c.req.valid("json");
    const result = await svc.extractFromText(text);
    return c.json(result);
});

cvRoutes.post(
    "/suggest-skills",
    zValidator(
        "json",
        z.object({
            role: z.string().min(1),
            existingSkills: z.array(z.string()).default([]),
        }),
    ),
    async (c) => {
        const { role, existingSkills } = c.req.valid("json");
        const skills = await svc.suggestSkills(role, existingSkills);
        return c.json({ skills });
    },
);

    return cvRoutes;
}