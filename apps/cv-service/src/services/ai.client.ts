function getBaseUrl() {
    return process.env.AI_SERVICE_URL ?? "http://localhost:3004";
}
function getSecret() {
    return process.env.INTERNAL_SERVICE_SECRET ?? "dev-secret-change-in-prod";
}

async function post<T>(path: string, body: object): Promise<T> {
    const res = await fetch(`${getBaseUrl()}/ai/cv${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-internal-secret": getSecret(),
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`[ai-service] ${res.status} ${path}: ${err}`);
    }
    return res.json() as Promise<T>;
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

export interface EnhanceResult {
    enhanced: string;
}
export interface TailorResult {
    summary: string;
    suggestedSkills: string[];
    suggestedKeywords: string[];
}
export interface CoverLetterResult {
    content: string;
}

export interface ExtractResult {
    personalInfo: {
        firstName: string;
        lastName: string;
        roleTitle: string;
        email: string;
        phone: string;
        location: string;
        linkedin: string;
        github: string;
        website: string;
    };
    summary: string;
    experience: Array<{
        company: string;
        position: string;
        startDate: string;
        endDate: string;
        current: boolean;
        location: string;
        description: string;
    }>;
    education: Array<{
        institution: string;
        degree: string;
        field: string;
        startDate: string;
        endDate: string;
        gpa: string;
    }>;
    skills: Array<{ category: string; skills: string[] }>;
    languages: Array<{ language: string; level: string }>;
    certifications: Array<{ name: string; issuer: string; date: string }>;
}

export class AiClient {
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
