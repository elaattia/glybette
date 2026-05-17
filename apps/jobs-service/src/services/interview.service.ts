import { AiClient } from "./ai.client.js";
const ai = new AiClient();

export class InterviewService {
    
    async generateQuestions(offreId: string, userId: string, userProfile: any, offreText: string) {
        return ai.generateInterviewQuestions(offreText, userProfile);
    }

    
    async evaluateAnswer(question: string, answer: string, jobContext: string) {
        return ai.evaluateInterviewAnswer(question, answer, jobContext);
    }

    
    async getPreparationPlan(offreText: string, userProfile: any) {
        return ai.getInterviewPreparationPlan(offreText, userProfile);
    }
}