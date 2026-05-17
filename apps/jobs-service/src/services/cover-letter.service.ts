import { AiClient } from "./ai.client.js";
const ai = new AiClient();

export class CoverLetterService {
    async generate(params: {
        cvText: string;
        offreText: string;
        tone: "professional" | "enthusiastic" | "concise";
        userAchievements?: string[];
        targetRole?: string;
    }) {
        return ai.generateJobCoverLetter(params);
    }

    async refine(params: {
        currentLetter: string;
        feedback: string;
        offreText: string;
    }) {
        return ai.refineCoverLetter(params);
    }
}