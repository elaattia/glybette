import { internalRequestJson } from "@glybette/utils";
import { loadEnv } from "../config/env.js";

const env = loadEnv();

function getBaseUrl() {
    return env.AI_SERVICE_URL;
}

function getSecret() {
    return env.INTERNAL_SERVICE_SECRET;
}

async function post<T>(path: string, body: object, timeoutMs?: number): Promise<T> {
    return internalRequestJson<T>(`${getBaseUrl()}/ai/cv${path}`, {
        method: "POST",
        timeoutMs: timeoutMs ?? env.AI_REQUEST_TIMEOUT_MS,
        internalSecret: getSecret(),
        body: JSON.stringify(body),
    });
}

export interface AtsScoreResult {
    score: number;
    missingKeywords: string[];
    matchedKeywords: string[];
    suggestions: string[];
    breakdown: { keywordMatch: number; formatting: number; completeness: number; relevance: number };
}

export interface SuggestionsResult {
    suggestions: Array<{ section: string; issue: string; suggestion: string; priority: "high" | "medium" | "low" }>;
}

export interface EnhanceResult { enhanced: string }
export interface TailorResult { summary: string; suggestedSkills: string[]; suggestedKeywords: string[] }
export interface CoverLetterResult { content: string }

export interface ExtractResult {
    personalInfo: {
        firstName: string; lastName: string; roleTitle: string;
        email: string; phone: string; location: string;
        linkedin: string; github: string; website: string;
    };
    summary: string;
    experience: Array<{
        company: string; position: string; startDate: string;
        endDate: string; current: boolean; location: string; description: string;
    }>;
    education: Array<{
        institution: string; degree: string; field: string;
        startDate: string; endDate: string; gpa: string;
    }>;
    skills: Array<{ category: string; skills: string[] }>;
    languages: Array<{ language: string; level: string }>;
    certifications: Array<{ name: string; issuer: string; date: string }>;
}

export class AiClient {
    scoreAtsCvOnly(cvText: string) {
        return post<AtsScoreResult>("/ats-score-cv", { cvText });
    }

    scoreAts(cvText: string, jobDescription: string) {
        return post<AtsScoreResult>("/ats-score", { cvText, jobDescription });
    }
    suggestImprovements(cvText: string, targetRole?: string) {
        return post<SuggestionsResult>("/suggestions", { cvText, targetRole });
    }
    enhanceText(text: string, sectionType: string, context?: { jobTitle?: string }) {
        return post<EnhanceResult>("/enhance", { text, sectionType, ...context });
    }
    tailorCv(cvText: string, jobDescription: string) {
        return post<TailorResult>("/tailor", { cvText, jobDescription });
    }
    generateCoverLetter(cvText: string, jobDescription: string, tone?: string) {
        return post<CoverLetterResult>("/cover-letter", { cvText, jobDescription, tone: tone ?? "professional" });
    }
    extractFromText(text: string) {
        return post<ExtractResult>("/extract", { text });
    }
    suggestSkills(role: string, existingSkills: string[]) {
        return post<{ skills: string[] }>("/suggest-skills", { role, existingSkills });
    }
}
