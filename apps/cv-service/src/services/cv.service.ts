import { CvRepository } from "../repositories/Cv.repository.js";
import { AiClient } from "./ai.client.js";
import { PdfService } from "./pdf.service.js";
import type {
    PersonalInfoData,
    ExperienceItem,
    EducationItem,
    SkillGroup,
    LanguageItem,
    CertificationItem,
} from "@glybette/types";

const repo = new CvRepository();
const aiClient = new AiClient();
const pdfService = new PdfService();

const MAX_CVS = 20;

function cvToText(cv: { title: string; sections: Array<{ type: string; data: unknown }> }): string {
    const lines: string[] = [`CV: ${cv.title}\n`];

    for (const s of cv.sections) {
        switch (s.type) {
            case "personal-info": {
                const d = s.data as PersonalInfoData;
                lines.push("--- CONTACT ---");
                if (d.firstName || d.lastName) lines.push(`Name: ${d.firstName} ${d.lastName}`.trim());
                if (d.roleTitle) lines.push(`Role: ${d.roleTitle}`);
                if (d.email) lines.push(`Email: ${d.email}`);
                if (d.phone) lines.push(`Phone: ${d.phone}`);
                if (d.location) lines.push(`Location: ${d.location}`);
                if (d.linkedin) lines.push(`LinkedIn: ${d.linkedin}`);
                if (d.github) lines.push(`GitHub: ${d.github}`);
                if (d.portfolio) lines.push(`portfolio: ${d.portfolio}`);
                break;
            }
            case "summary": {
                const d = s.data as { text: string };
                if (d.text) {
                    lines.push("--- SUMMARY ---");
                    lines.push(d.text);
                }
                break;
            }
            case "experience": {
                const items = s.data as ExperienceItem[];
                if (items.length) {
                    lines.push("--- EXPERIENCE ---");
                    for (const e of items) {
                        lines.push(
                            `${e.position} at ${e.company} (${e.startDate} – ${e.current ? "Present" : e.endDate})`,
                        );
                        if (e.location) lines.push(`  Location: ${e.location}`);
                        if (e.description) lines.push(`  ${e.description}`);
                    }
                }
                break;
            }
            case "education": {
                const items = s.data as EducationItem[];
                if (items.length) {
                    lines.push("--- EDUCATION ---");
                    for (const e of items) {
                        lines.push(`${e.degree}${e.field ? ` in ${e.field}` : ""} – ${e.institution} (${e.endDate})`);
                        if (e.gpa) lines.push(`  GPA: ${e.gpa}`);
                    }
                }
                break;
            }
            case "skills": {
                const groups = s.data as SkillGroup[];
                if (groups.length) {
                    lines.push("--- SKILLS ---");
                    for (const g of groups) lines.push(`${g.category}: ${g.skills.join(", ")}`);
                }
                break;
            }
            case "languages": {
                const items = s.data as LanguageItem[];
                if (items.length)
                    lines.push(`--- LANGUAGES ---\n${items.map((l) => `${l.language} (${l.level})`).join(", ")}`);
                break;
            }
            case "certifications": {
                const items = s.data as CertificationItem[];
                if (items.length) {
                    lines.push("--- CERTIFICATIONS ---");
                    for (const c of items) lines.push(`${c.name} – ${c.issuer} (${c.date})`);
                }
                break;
            }
            case "projects": {
                const items = s.data as Array<{ name: string; description: string; technologies: string[] }>;
                if (items.length) {
                    lines.push("--- PROJECTS ---");
                    for (const p of items) {
                        lines.push(`${p.name}: ${p.description}`);
                        if (p.technologies?.length) lines.push(`  Tech: ${p.technologies.join(", ")}`);
                    }
                }
                break;
            }
        }
    }

    return lines.join("\n");
}

function err404() {
    return Object.assign(new Error("CV not found"), { status: 404 });
}
function err429() {
    return Object.assign(new Error(`CV limit reached (max ${MAX_CVS})`), { status: 429 });
}

export class CvService {
    getUserCvs(userId: string) {
        return repo.findAllByUser(userId);
    }

    async getCvById(id: string, userId: string) {
        const cv = await repo.findById(id, userId);
        if (!cv) throw err404();
        return cv;
    }

    async createCv(userId: string, dto: { title: string; template: string; sections?: unknown[] }) {
        if ((await repo.countByUser(userId)) >= MAX_CVS) throw err429();
        return repo.create(userId, dto);
    }

    async updateCv(
        id: string,
        userId: string,
        dto: { title?: string; template?: string; sections?: unknown[]; pdfUrl?: string; isPublic?: boolean },
    ) {
        const cv = await repo.update(id, userId, dto);
        if (!cv) throw err404();
        return cv;
    }

    async deleteCv(id: string, userId: string) {
        if (!(await repo.delete(id, userId))) throw err404();
    }

    async duplicateCv(id: string, userId: string) {
        const cv = await repo.duplicate(id, userId);
        if (!cv) throw err404();
        return cv;
    }

    async sharePublic(id: string, userId: string) {
        const cv = await repo.generateShareToken(id, userId);
        if (!cv) throw err404();
        return { shareToken: cv.shareToken, shareUrl: `/share/${cv.shareToken}` };
    }

    async revokeShare(id: string, userId: string) {
        const cv = await repo.revokeShare(id, userId);
        if (!cv) throw err404();
        return cv;
    }

    async getPublicCv(token: string) {
        const cv = await repo.findByShareToken(token);
        if (!cv) throw err404();
        return cv;
    }

    async exportPdf(id: string, userId: string) {
        const cv = await this.getCvById(id, userId);
        try {
            const pdfUrl = await pdfService.generatePdf(cv as Parameters<typeof pdfService.generatePdf>[0]);
            await repo.update(id, userId, { pdfUrl });
            return { pdfUrl };
        } catch (err: any) {
            console.error("[exportPdf] ERREUR COMPLETE:", err?.message);
            console.error("[exportPdf] STACK:", err?.stack);
            throw err;
        }
    }

    async scoreAts(id: string, userId: string, jobDescription: string) {
        const cv = await this.getCvById(id, userId);
        const text = cvToText(cv as Parameters<typeof cvToText>[0]);
        const result = await aiClient.scoreAts(text, jobDescription);
        await repo.updateAtsScore(id, userId, result);
        return result;
    }

    async suggestImprovements(id: string, userId: string, targetRole?: string) {
        const cv = await this.getCvById(id, userId);
        return aiClient.suggestImprovements(cvToText(cv as Parameters<typeof cvToText>[0]), targetRole);
    }

    async enhanceSection(id: string, userId: string, text: string, sectionType: string) {
        const cv = await this.getCvById(id, userId);
        const sections = cv.sections as Array<{ type: string; data: unknown }>;
        const personal = sections.find((s) => s.type === "personal-info")?.data as PersonalInfoData | undefined;
        return aiClient.enhanceText(text, sectionType, { jobTitle: personal?.roleTitle });
    }

    async tailorCv(id: string, userId: string, jobDescription: string) {
        const cv = await this.getCvById(id, userId);
        return aiClient.tailorCv(cvToText(cv as Parameters<typeof cvToText>[0]), jobDescription);
    }

    async generateCoverLetter(id: string, userId: string, jobDescription: string, tone?: string) {
        const cv = await this.getCvById(id, userId);
        return aiClient.generateCoverLetter(cvToText(cv as Parameters<typeof cvToText>[0]), jobDescription, tone);
    }

    extractFromText(text: string) {
        return aiClient.extractFromText(text);
    }

    suggestSkills(role: string, existingSkills: string[]) {
        return aiClient.suggestSkills(role, existingSkills);
    }
}
