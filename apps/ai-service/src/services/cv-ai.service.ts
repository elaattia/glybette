import type { AiProvider } from "../lib/ai-provider.types.js";

export interface AtsScoreResult {
    score: number;
    missingKeywords: string[];
    matchedKeywords: string[];
    suggestions: string[];
    strengths: string[];
    weaknesses: string[];
    tips: string[];
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
    projects: Array<{ name: string; description: string; technologies: string[] }>;
    languages: Array<{ language: string; level: string }>;
    certifications: Array<{ name: string; issuer: string; date: string }>;
}

export class CvAiService {
    constructor(private readonly provider: AiProvider) {}
    async scoreAtsCvOnly(cvText: string): Promise<AtsScoreResult> {
        const prompt = `You are an ATS (Applicant Tracking System) expert.
Analyze ONLY the CV below. Do NOT compare it to any job description.
Evaluate how well-structured and ATS-readable the CV is based on:
1. Presence of key sections (Experience, Education, Skills, Contact info)
2. ATS-compatible formatting (no complex tables, no columns, no graphics described)
3. Text readability and appropriate length
4. Use of generic industry action verbs and keywords
5. Overall document structure and completeness

Scoring guide:
- 90-100: Excellent ATS compatibility, all sections present, strong keywords
- 75-89:  Good structure, minor improvements possible
- 60-74:  Acceptable but missing some important elements
- 40-59:  Needs significant improvement
- 0-39:   Poor ATS compatibility

Return ONLY this JSON object, no explanation, no markdown fences:
{
  "score": 78,
  "missingKeywords": ["quantified results", "action verbs"],
  "matchedKeywords": ["experience", "education", "skills", "contact"],
  "suggestions": [
    "Structure looks good, but lacks quantifiable achievements."
  ],
  "strengths": [
    "Clear separation of sections",
    "Good use of professional keywords in the summary"
  ],
  "weaknesses": [
    "No metrics or numbers to back up experience",
    "Missing some basic contact information"
  ],
  "tips": [
    "Add 2-3 bullet points with percentages or numbers in your most recent role to show impact.",
    "Ensure your LinkedIn URL is clickable and professional."
  ],
  "breakdown": {
    "keywordMatch": 70,
    "formatting": 85,
    "completeness": 75,
    "relevance": 80
  }
}

=== CV TEXT ===
${cvText.slice(0, 4000)}`;
        return this.provider.generateJson<AtsScoreResult>(prompt, { maxTokens: 1200 });
    }

    async scoreAts(cvText: string, jobDescription: string): Promise<AtsScoreResult> {
        const prompt = `You are an ATS expert. Analyze the CV against the job description.

=== CV ===
${cvText.slice(0, 4000)}

=== JOB DESCRIPTION ===
${jobDescription.slice(0, 2000)}

Return ONLY this JSON object, no explanation, no markdown:
{
  "score": 75,
  "missingKeywords": ["keyword1", "keyword2"],
  "matchedKeywords": ["keyword3", "keyword4"],
  "suggestions": ["General suggestion"],
  "strengths": ["Matches required domain experience"],
  "weaknesses": ["Lacks mentioning specific CRM software requested"],
  "tips": ["Add the specific CRM tools you used in your past roles."],
  "breakdown": { "keywordMatch": 70, "formatting": 80, "completeness": 75, "relevance": 75 }
}`;
        return this.provider.generateJson<AtsScoreResult>(prompt, { maxTokens: 1200 });
    }

    async suggestImprovements(cvText: string): Promise<SuggestionsResult> {
        const prompt = `You are an expert CV coach. Analyze this CV and give 5 specific improvement suggestions.

=== CV ===
${cvText.slice(0, 4000)}

Return ONLY this JSON object, no explanation, no markdown:
{
  "suggestions": [
    { "section": "Experience", "issue": "Description lacks quantified results", "suggestion": "Add specific metrics.", "priority": "high" }
  ]
}
Priority must be "high", "medium", or "low". Provide exactly 5 suggestions.`;
        return this.provider.generateJson<SuggestionsResult>(prompt, { maxTokens: 1000 });
    }

    async enhanceText(text: string, sectionType: string, context?: { jobTitle?: string }): Promise<EnhanceResult> {
        const ctxHint = context?.jobTitle ? `Poste visé : ${context.jobTitle}` : "";
        const isLikelyFrench =
            /[àâäéèêëîïôùûüç]/i.test(text) || /\b(je|mon|ma|les|des|une|pour|dans|avec|en|sur|par)\b/i.test(text);
        const langInstruction = isLikelyFrench
            ? "IMPORTANT: Tu DOIS répondre UNIQUEMENT en français."
            : "IMPORTANT: You MUST respond ONLY in English.";

        const prompt = `${langInstruction}
You are an expert CV writer. Rewrite the following ${sectionType} text to be more impactful.
${ctxHint}

Strict rules:
- ${langInstruction}
- Use strong action verbs
- Keep roughly the same length
- Do NOT invent company names, dates, or titles not present in the original
- Return ONLY the rewritten text, nothing else, no label, no prefix

=== ORIGINAL TEXT ===
${text}

=== REWRITTEN TEXT ===`;

        const enhanced = await this.provider.generateText(prompt, { maxTokens: 500 });
        const clean = enhanced
            .replace(/^(texte réécrit|rewritten text|enhanced text|résultat|result)[:\s]*/i, "")
            .trim();
        return { enhanced: clean };
    }

    async tailorCv(cvText: string, jobDescription: string): Promise<TailorResult> {
        const prompt = `You are a CV consultant. Analyze this CV and job description.

=== CV ===
${cvText.slice(0, 3000)}

=== JOB DESCRIPTION ===
${jobDescription.slice(0, 2000)}

Return ONLY this JSON, no markdown, no explanation:
{
  "summary": "A 3-4 sentence professional summary tailored to this job.",
  "suggestedSkills": ["skill1", "skill2", "skill3"],
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3"]
}`;
        return this.provider.generateJson<TailorResult>(prompt, { maxTokens: 700 });
    }

    async generateCoverLetter(
        cvText: string,
        jobDescription: string,
        tone: "professional" | "enthusiastic" | "concise" = "professional",
    ): Promise<CoverLetterResult> {
        const toneGuide: Record<string, string> = {
            professional: "formal, confident, and professional",
            enthusiastic: "energetic, passionate, and engaging",
            concise: "brief and impactful — maximum 3 short paragraphs",
        };
        const prompt = `Write a cover letter in a ${toneGuide[tone]} tone.
Use the same language as the CV (if CV is in French, write in French).

=== CV ===
${cvText.slice(0, 3000)}

=== JOB DESCRIPTION ===
${jobDescription.slice(0, 1500)}

Return ONLY the letter text, no subject line, no markdown.`;
        const content = await this.provider.generateText(prompt, { maxTokens: 700 });
        return { content: content.trim() };
    }

    async extractFromText(rawText: string): Promise<ExtractResult> {
        const text = rawText.slice(0, 3000);

        const prompt = `Extract all structured information from this CV text.
Return ONLY valid JSON matching this exact structure (use "" for missing strings, [] for empty arrays, false for current when unknown):
{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "roleTitle": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "website": ""
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "location": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }
  ],
  "skills": [
    { "category": "", "skills": [] }
  ],
  "projects": [
    { "name": "", "description": "", "technologies": [] }
  ],
  "languages": [
    { "language": "", "level": "" }
  ],
  "certifications": [
    { "name": "", "issuer": "", "date": "" }
  ]
}
No explanation, no markdown fences.

CV TEXT:
${text}`;

        try {
            const result = await this.provider.generateJson<ExtractResult>(prompt, { maxTokens: 2800 });
            return {
                personalInfo: result.personalInfo ?? emptyPersonal(),
                summary: result.summary ?? "",
                experience: result.experience ?? [],
                education: result.education ?? [],
                skills: result.skills ?? [],
                projects: result.projects ?? [],
                languages: result.languages ?? [],
                certifications: result.certifications ?? [],
            };
        } catch (e) {
            console.error("[extractFromText] failed:", e);
            return {
                personalInfo: emptyPersonal(),
                summary: "",
                experience: [],
                education: [],
                skills: [],
                projects: [],
                languages: [],
                certifications: [],
            };
        }
    }

    async suggestSkills(role: string, existingSkills: string[]): Promise<string[]> {
        const existing = existingSkills.length
            ? `Do not include these already listed: ${existingSkills.slice(0, 20).join(", ")}`
            : "";
        const prompt = `List 8 relevant technical and professional skills for a "${role}" role.
${existing}
Return ONLY a JSON array of strings, no markdown: ["skill1", "skill2", "skill3"]`;
        return this.provider.generateJson<string[]>(prompt, { maxTokens: 200 });
    }
}

function emptyPersonal() {
    return {
        firstName: "",
        lastName: "",
        roleTitle: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        website: "",
    };
}