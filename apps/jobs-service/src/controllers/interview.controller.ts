import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { InterviewService } from "../services/interview.service.js";
import { OffreModel } from "../models/Offre.model.js";

const interviewService = new InterviewService();
export const interviewController = new Hono();

function uid(c: any): string {
    const id = c.get("userId") as string;
    if (!id) throw Object.assign(new Error("Unauthorized"), { status: 401 });
    return id;
}

interviewController.post(
    "/questions/:offreId",
    zValidator("json", z.object({ userProfile: z.any() })),
    async (c) => {
        const offre = await OffreModel.findById(c.req.param("offreId")).lean();
        if (!offre) return c.json({ error: "Offre not found" }, 404);

        const offreText = `${offre.titre}\n${offre.description ?? ""}\nCompétences: ${offre.competences?.join(", ")}`;
        const { userProfile } = c.req.valid("json");
        const result = await interviewService.generateQuestions(
            c.req.param("offreId"),
            uid(c),
            userProfile,
            offreText,
        );
        return c.json(result);
    },
);

interviewController.post(
    "/evaluate",
    zValidator(
        "json",
        z.object({
            question: z.string().min(1),
            answer: z.string().min(1),
            jobContext: z.string().optional().default(""),
        }),
    ),
    async (c) => {
        const { question, answer, jobContext } = c.req.valid("json");
        const result = await interviewService.evaluateAnswer(question, answer, jobContext);
        return c.json(result);
    },
);

interviewController.post(
    "/plan/:offreId",
    zValidator("json", z.object({ userProfile: z.any() })),
    async (c) => {
        const offre = await OffreModel.findById(c.req.param("offreId")).lean();
        if (!offre) return c.json({ error: "Offre not found" }, 404);
        const offreText = `${offre.titre}\n${offre.description ?? ""}`;
        const { userProfile } = c.req.valid("json");
        const result = await interviewService.getPreparationPlan(offreText, userProfile);
        return c.json(result);
    },
);