import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AiProvider } from "../lib/ai-provider.types.js";
import { JobsAiService } from "../services/jobs-ai.service.js";

export function createJobsRoutes(provider: AiProvider): Hono {
    const svc = new JobsAiService(provider);
    const jobsRoutes = new Hono();

jobsRoutes.post(
    "/matching",
    zValidator("json", z.object({ profileText: z.string().min(1), offreText: z.string().min(1) })),
    async (c) => {
        const { profileText, offreText } = c.req.valid("json");
        const result = await svc.computeMatching(profileText, offreText);
        return c.json(result);
    },
);

jobsRoutes.post(
    "/interview/questions",
    zValidator("json", z.object({ offreText: z.string().min(1), userProfile: z.any() })),
    async (c) => {
        const { offreText, userProfile } = c.req.valid("json");
        const result = await svc.generateInterviewQuestions(offreText, userProfile);
        return c.json(result);
    },
);

jobsRoutes.post(
    "/interview/evaluate",
    zValidator("json", z.object({ question: z.string(), answer: z.string(), jobContext: z.string().optional() })),
    async (c) => {
        const { question, answer, jobContext } = c.req.valid("json");
        const result = await svc.evaluateInterviewAnswer(question, answer, jobContext ?? "");
        return c.json(result);
    },
);

jobsRoutes.post(
    "/interview/plan",
    zValidator("json", z.object({ offreText: z.string(), userProfile: z.any() })),
    async (c) => {
        const { offreText, userProfile } = c.req.valid("json");
        const result = await svc.getInterviewPreparationPlan(offreText, userProfile);
        return c.json(result);
    },
);

jobsRoutes.post(
    "/chat",
    zValidator(
        "json",
        z.object({
            offreText: z.string().min(1),
            messages: z.array(
                z.object({
                    role: z.enum(["user", "assistant"]),
                    content: z.string(),
                }),
            ),
            userProfile: z.any().optional(),
        }),
    ),
    async (c) => {
        const { offreText, messages, userProfile } = c.req.valid("json");
        const result = await svc.chatAboutJob(offreText, messages, userProfile);
        return c.json(result);
    },
);

jobsRoutes.post(
    "/cv-tailored-sections",
    zValidator(
        "json",
        z.object({
            cvText: z.string().min(1),
            offreText: z.string().min(1),
        }),
    ),
    async (c) => {
        const { cvText, offreText } = c.req.valid("json");
        const result = await svc.generateTailoredCvSections(cvText, offreText);
        return c.json(result);
    },
);

jobsRoutes.post(
    "/cover-letter",
    zValidator(
        "json",
        z.object({
            cvText: z.string().min(1),
            offreText: z.string().min(1),
            tone: z.enum(["professional", "enthusiastic", "concise"]).default("professional"),
            userAchievements: z.array(z.string()).default([]),
        }),
    ),
    async (c) => {
        const data = c.req.valid("json");
        const result = await svc.generateJobCoverLetter(data);
        return c.json(result);
    },
);

jobsRoutes.post(
    "/cover-letter/refine",
    zValidator("json", z.object({ currentLetter: z.string(), feedback: z.string(), offreText: z.string() })),
    async (c) => {
        const data = c.req.valid("json");
        const result = await svc.refineCoverLetter(data);
        return c.json(result);
    },
);

jobsRoutes.post(
    "/cv-improvements",
    zValidator("json", z.object({ cvText: z.string().min(1), offreText: z.string().min(1) })),
    async (c) => {
        const { cvText, offreText } = c.req.valid("json");
        const result = await svc.suggestCvImprovements(cvText, offreText);
        return c.json(result);
    },
);

    return jobsRoutes;
}