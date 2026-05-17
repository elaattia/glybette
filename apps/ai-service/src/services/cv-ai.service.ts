import { callOllama, callOllamaJson } from "../lib/ollama.js";

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
    projects: Array<{ name: string; description: string; technologies: string[] }>;
    languages: Array<{ language: string; level: string }>;
    certifications: Array<{ name: string; issuer: string; date: string }>;
}

export class CvAiService {
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
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "breakdown": { "keywordMatch": 70, "formatting": 80, "completeness": 75, "relevance": 75 }
}`;
        return callOllamaJson<AtsScoreResult>(prompt, { maxTokens: 800 });
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
        return callOllamaJson<SuggestionsResult>(prompt, { maxTokens: 1000 });
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

        const enhanced = await callOllama(prompt, { maxTokens: 500 });
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
        return callOllamaJson<TailorResult>(prompt, { maxTokens: 700 });
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
        const content = await callOllama(prompt, { maxTokens: 700 });
        return { content: content.trim() };
    }

    async extractFromText(rawText: string): Promise<ExtractResult> {
        const text = rawText.slice(0, 3000);
        console.log("[extractFromText] text length:", text.length);

        
        const prompt1 = `Extract personal information and professional summary from this CV text.
Return ONLY valid JSON matching this exact structure:
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
  "summary": ""
}
Use empty string "" for any missing field. No explanation, no markdown fences.

CV TEXT:
${text}`;

        
        const prompt2 = `Extract work experience and education from this CV text.
Return ONLY valid JSON matching this exact structure:
{
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
  ]
}
Use empty arrays [] if none found. No explanation, no markdown fences.

CV TEXT:
${text}`;

        
        const prompt3 = `Extract skills, projects, languages and certifications from this CV text.
Return ONLY valid JSON matching this exact structure:
{
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
Use empty arrays [] if none found. No explanation, no markdown fences.

CV TEXT:
${text}`;

        let p1: { personalInfo: ExtractResult["personalInfo"]; summary: string } | null = null;
        let p2: { experience: ExtractResult["experience"]; education: ExtractResult["education"] } | null = null;
        let p3: {
            skills: ExtractResult["skills"];
            projects: ExtractResult["projects"];
            languages: ExtractResult["languages"];
            certifications: ExtractResult["certifications"];
        } | null = null;

        try {
            console.log("[extractFromText] step 1: personal info + summary");
            p1 = await callOllamaJson(prompt1, { maxTokens: 600 });
            console.log("[extractFromText] step 1 ok:", JSON.stringify(p1?.personalInfo?.firstName));
        } catch (e) {
            console.error("[extractFromText] step 1 failed:", e);
        }

        try {
            console.log("[extractFromText] step 2: experience + education");
            p2 = await callOllamaJson(prompt2, { maxTokens: 1200 });
            console.log("[extractFromText] step 2 ok, exp count:", p2?.experience?.length);
        } catch (e) {
            console.error("[extractFromText] step 2 failed:", e);
        }

        try {
            console.log("[extractFromText] step 3: skills + projects + languages + certs");
            p3 = await callOllamaJson(prompt3, { maxTokens: 1000 });
            console.log("[extractFromText] step 3 ok, skills count:", p3?.skills?.length);
        } catch (e) {
            console.error("[extractFromText] step 3 failed:", e);
        }

        const result: ExtractResult = {
            personalInfo: p1?.personalInfo ?? emptyPersonal(),
            summary: p1?.summary ?? "",
            experience: p2?.experience ?? [],
            education: p2?.education ?? [],
            skills: p3?.skills ?? [],
            projects: p3?.projects ?? [],
            languages: p3?.languages ?? [],
            certifications: p3?.certifications ?? [],
        };

        console.log("[extractFromText] result:", {
            hasPersonal: !!result.personalInfo.firstName,
            expCount: result.experience.length,
            eduCount: result.education.length,
            skillCount: result.skills.length,
        });

        return result;
    }

    async suggestSkills(role: string, existingSkills: string[]): Promise<string[]> {
        const existing = existingSkills.length
            ? `Do not include these already listed: ${existingSkills.slice(0, 20).join(", ")}`
            : "";
        const prompt = `List 8 relevant technical and professional skills for a "${role}" role.
${existing}
Return ONLY a JSON array of strings, no markdown: ["skill1", "skill2", "skill3"]`;
        return callOllamaJson<string[]>(prompt, { maxTokens: 200 });
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
