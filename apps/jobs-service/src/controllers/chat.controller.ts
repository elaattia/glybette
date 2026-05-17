import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AiClient } from "../services/ai.client.js";
import { OffreModel } from "../models/Offre.model.js";

const ai = new AiClient();
export const chatController = new Hono();

chatController.post(
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
        const result = await ai.chatAboutJob(offreText, messages, userProfile);
        return c.json(result);
    },
);

chatController.post(
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
        const result = await ai.generateTailoredCvSections(cvText, offreText);
        return c.json(result);
    },
);