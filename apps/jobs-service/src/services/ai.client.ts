import { internalRequestJson } from "@glybette/utils";
import { loadEnv } from "../config/env.js";

const env = loadEnv();

async function post<T>(path: string, body: object): Promise<T> {
    return internalRequestJson<T>(`${env.AI_SERVICE_URL}/ai/jobs${path}`, {
        method: "POST",
        timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
        internalSecret: env.INTERNAL_SERVICE_SECRET,
        body: JSON.stringify(body),
    });
}

export interface MatchingResult {
    score: number;
    pointsForts: string[];
    pointsFaibles: string[];
    recommandations: string[];
    skillsManquantes: string[];
    skillsCorrespondantes: string[];
    explication: string;
}

export interface InterviewQuestionsResult {
    behavioural: string[];
    technical: string[];
    situational: string[];
    tips: string[];
}

export interface InterviewEvalResult {
    score: number;
    strengths: string[];
    improvements: string[];
    suggestedAnswer: string;
    keywords: string[];
}

export interface CvImprovementResult {
    suggestedSummary: string;
    suggestedSkillsToAdd: string[];
    suggestedProjectsDescription: string;
    sectionImprovements: Array<{
        section: string;
        current: string;
        suggested: string;
        reason: string;
    }>;
    overallAdvice: string;
}

export interface ChatResult {
    content: string;
    role: "assistant";
}

export interface TailoredCvSectionsResult {
    title: string;
    personalInfo: { roleTitle: string };
    summary: string;
    experience: Array<{
        position: string;
        company: string;
        description: string;
        startDate: string;
        endDate: string;
        current: boolean;
        location: string;
    }>;
    skills: Array<{ category: string; skills: string[] }>;
    keywordsAdded: string[];
    suggestions: string[];
}

export class AiClient {
    computeMatching(profileText: string, offreText: string) {
        return post<MatchingResult>("/matching", { profileText, offreText });
    }

    generateInterviewQuestions(offreText: string, userProfile: any) {
        return post<InterviewQuestionsResult>("/interview/questions", { offreText, userProfile });
    }

    evaluateInterviewAnswer(question: string, answer: string, jobContext: string) {
        return post<InterviewEvalResult>("/interview/evaluate", { question, answer, jobContext });
    }

    getInterviewPreparationPlan(offreText: string, userProfile: any) {
        return post<any>("/interview/plan", { offreText, userProfile });
    }

    generateJobCoverLetter(params: any) {
        return post<{ content: string }>("/cover-letter", params);
    }

    refineCoverLetter(params: any) {
        return post<{ content: string }>("/cover-letter/refine", params);
    }

    suggestCvImprovements(cvText: string, offreText: string) {
        return post<CvImprovementResult>("/cv-improvements", { cvText, offreText });
    }

    chatAboutJob(
        offreText: string,
        messages: Array<{ role: "user" | "assistant"; content: string }>,
        userProfile?: any,
    ) {
        return post<ChatResult>("/chat", { offreText, messages, userProfile });
    }

    generateTailoredCvSections(cvText: string, offreText: string) {
        return post<TailoredCvSectionsResult>("/cv-tailored-sections", { cvText, offreText });
    }
}
