import type { TemplateInfo, CvSection, CvTemplateDomain } from "./types/cv.types";


export const TEMPLATES: TemplateInfo[] = [
    {
        id: "creative",
        name: "Élégant",
        category: "ats",
        domains: ["general", "business", "marketing", "finance", "legal"],
        isAtsReady: true,
        previewBg: "#1a3a5c",
        accentColor: "#16A34A",
        description: "Deux colonnes, emplacement photo, sobre et professionnel",
    },
    {
        id: "minimalist",
        name: "Minimaliste",
        category: "ats",
        domains: ["general", "finance", "legal", "business", "design"],
        isAtsReady: true,
        previewBg: "#f8f8f8",
        accentColor: "#1a1a1a",
        description: "Tout en typographie, espaces généreux, intemporel",
    },
    {
        id: "modern-strategy",
        name: "Impact",
        category: "fancy",
        domains: ["design", "marketing", "general", "it"],
        isAtsReady: true,
        previewBg: "#111827",
        accentColor: "#f97316",
        description: "Header sombre audacieux, sidebar colorée avec photo",
    },
    {
        id: "tech",
        name: "Tech",
        category: "ats",
        domains: ["it", "engineering"],
        isAtsReady: true,
        previewBg: "#0f172a",
        accentColor: "#38bdf8",
        description: "Dark mode, blocs de code, idéal pour les développeurs",
    },
    {
        id: "classic-reinvented",
        name: "Classique",
        category: "ats",
        domains: ["academic", "healthcare", "legal", "general", "finance"],
        isAtsReady: true,
        previewBg: "#1e3a5f",
        accentColor: "#3b82f6",
        description: "Serif élégant, entête centré, style académique raffiné",
    },
];

export const DOMAIN_LABELS: Record<CvTemplateDomain, string> = {
    general: "Général",
    it: "IT & Tech",
    design: "Design",
    business: "Business",
    academic: "Académique",
    healthcare: "Santé",
    engineering: "Ingénierie",
    marketing: "Marketing",
    legal: "Juridique",
    finance: "Finance",
};


const BASE_SECTIONS = (): CvSection[] => [
    {
        type: "personal-info",
        order: 0,
        data: {
            firstName: "",
            lastName: "",
            roleTitle: "",
            email: "",
            phone: "",
            location: "",
            linkedin: "",
            github: "",
            portfolio: "",
            photo: "",
        },
    },
    { type: "summary", order: 1, data: { text: "" } },
    { type: "experience", order: 2, data: [] },
    { type: "education", order: 3, data: [] },
    { type: "skills", order: 4, data: [] },
];

const TECH_SECTIONS = (): CvSection[] => [
    {
        type: "personal-info",
        order: 0,
        data: {
            firstName: "",
            lastName: "",
            roleTitle: "",
            email: "",
            phone: "",
            location: "",
            linkedin: "",
            github: "",
            portfolio: "",
            photo: "",
        },
    },
    { type: "summary", order: 1, data: { text: "" } },
    {
        type: "skills",
        order: 2,
        data: [
            { id: "sg1", category: "Hard Skills", skills: [] },
            { id: "sg2", category: "Soft Skills", skills: [] },
            { id: "sg3", category: "DevOps & Tools", skills: [] },
        ],
    },
    { type: "experience", order: 3, data: [] },
    { type: "projects", order: 4, data: [] },
    { type: "education", order: 5, data: [] },
    { type: "certifications", order: 6, data: [] },
    { type: "languages", order: 7, data: [] },
];

const IMPACT_SECTIONS = (): CvSection[] => [
    {
        type: "personal-info",
        order: 0,
        data: {
            firstName: "",
            lastName: "",
            roleTitle: "",
            email: "",
            phone: "",
            location: "",
            linkedin: "",
            github: "",
            portfolio: "",
            photo: "",
        },
    },
    { type: "summary", order: 1, data: { text: "" } },
    { type: "skills", order: 2, data: [] },
    { type: "experience", order: 3, data: [] },
    { type: "projects", order: 4, data: [] },
    { type: "languages", order: 5, data: [] },
];

const CLASSIQUE_SECTIONS = (): CvSection[] => [
    {
        type: "personal-info",
        order: 0,
        data: {
            firstName: "",
            lastName: "",
            roleTitle: "",
            email: "",
            phone: "",
            location: "",
            linkedin: "",
            github: "",
            portfolio: "",
            photo: "",
        },
    },
    { type: "summary", order: 1, data: { text: "" } },
    { type: "education", order: 2, data: [] },
    { type: "experience", order: 3, data: [] },
    { type: "skills", order: 4, data: [] },
    { type: "certifications", order: 5, data: [] },
    { type: "languages", order: 6, data: [] },
];

export function getTemplate(id: string): TemplateInfo {
    return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function filterTemplates(
    category?: "ats" | "fancy" | "all",
    domain?: CvTemplateDomain | "all",
): TemplateInfo[] {
    return TEMPLATES.filter((t) => {
        const catMatch = !category || category === "all" || t.category === category;
        const domainMatch = !domain || domain === "all" || t.domains.includes(domain);
        return catMatch && domainMatch;
    });
}

export function makeDefaultSections(templateId?: string): CvSection[] {
    switch (templateId) {
        case "tech":
            return TECH_SECTIONS();
        case "impact":
            return IMPACT_SECTIONS();
        case "classique":
            return CLASSIQUE_SECTIONS();
        default:
            return BASE_SECTIONS();
    }
}