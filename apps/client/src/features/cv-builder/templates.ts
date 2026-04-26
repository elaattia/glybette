import type { TemplateInfo, CvSection, CvTemplateDomain } from "./types/cv.types";

export const TEMPLATES: TemplateInfo[] = [
    {
        id: "modern-strategy",
        name: "Moderne Stratège",
        category: "ats",
        domains: ["general", "business", "marketing", "finance"],
        isAtsReady: true,
        previewBg: "#1a3a5c",
        accentColor: "#16A34A",
        description: "Header sombre, titres verts — professionnel et impactant",
    },
    {
        id: "academic",
        name: "Académique Structuré",
        category: "ats",
        domains: ["academic", "healthcare", "legal"],
        isAtsReady: true,
        previewBg: "#3d2b1f",
        accentColor: "#8B4513",
        description: "Centré, serif, tons chauds — monde académique et médical",
    },
    {
        id: "minimalist",
        name: "Minimaliste Épuré",
        category: "ats",
        domains: ["general", "finance", "legal", "business"],
        isAtsReady: true,
        previewBg: "#f5f5f5",
        accentColor: "#222222",
        description: "Blanc pur, typographie nette — le contenu prime",
    },
    {
        id: "tech",
        name: "Développeur Tech",
        category: "ats",
        domains: ["it", "engineering"],
        isAtsReady: true,
        previewBg: "#0f172a",
        accentColor: "#38bdf8",
        description: "Dark mode, monospace, sections IT — conçu pour les devs",
    },
    {
        id: "classic-reinvented",
        name: "Classique Réinventé",
        category: "ats",
        domains: ["general", "finance", "business", "legal"],
        isAtsReady: true,
        previewBg: "#2C3E50",
        accentColor: "#3498DB",
        description: "Navy + bleu, deux colonnes bas — élégant et moderne",
    },
    {
        id: "creative",
        name: "Créatif Audacieux",
        category: "fancy",
        domains: ["design", "marketing", "general"],
        isAtsReady: true,
        previewBg: "#c0392b",
        accentColor: "#FF6B6B",
        description: "Sidebar colorée, photo ronde — pour les créatifs",
    },
    {
        id: "international",
        name: "L'International",
        category: "fancy",
        domains: ["general", "business", "marketing"],
        isAtsReady: true,
        previewBg: "#c0622e",
        accentColor: "#FF8C42",
        description: "Gradient diagonal, chaleureux — profils internationaux",
    },
    {
        id: "design-epure",
        name: "Design Épuré",
        category: "fancy",
        domains: ["design", "marketing", "it"],
        isAtsReady: true,
        previewBg: "#1a1a2e",
        accentColor: "#e94560",
        description: "Sombre dramatique, barre accent — pour les designers",
    },
    {
        id: "skills-focus",
        name: "Focus Compétences",
        category: "fancy",
        domains: ["it", "engineering", "design"],
        isAtsReady: true,
        previewBg: "#f8f4ef",
        accentColor: "#C0392B",
        description: "Barres de compétences visuelles — mise en avant technique",
    },
    {
        id: "startup",
        name: "Start-up",
        category: "fancy",
        domains: ["it", "business", "marketing", "engineering"],
        isAtsReady: true,
        previewBg: "#c0501f",
        accentColor: "#FF6B35",
        description: "Header diagonal, énergie start-up — profils dynamiques",
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
            { id: "sg3", category: "DevOps & Outils", skills: [] },
        ],
    },
    { type: "experience", order: 3, data: [] },
    { type: "projects", order: 4, data: [] },
    { type: "education", order: 5, data: [] },
    { type: "certifications", order: 6, data: [] },
    { type: "languages", order: 7, data: [] },
];

const ACADEMIC_SECTIONS = (): CvSection[] => [
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

const CREATIVE_SECTIONS = (): CvSection[] => [
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

export function getTemplate(id: string): TemplateInfo {
    return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function filterTemplates(category?: "ats" | "fancy" | "all", domain?: CvTemplateDomain | "all"): TemplateInfo[] {
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
        case "academic":
            return ACADEMIC_SECTIONS();
        case "creative":
        case "design-epure":
        case "skills-focus":
            return CREATIVE_SECTIONS();
        default:
            return BASE_SECTIONS();
    }
}
