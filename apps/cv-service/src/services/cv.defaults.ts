import { randomUUID } from "crypto";
import type { CvSection } from "../types/index.js";

export function getDefaultSections(): CvSection[] {
    return [
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
            },
        },
        {
            type: "summary",
            order: 1,
            data: { text: "" },
        },
        {
            type: "experience",
            order: 2,
            data: [],
        },
        {
            type: "education",
            order: 3,
            data: [],
        },
        {
            type: "skills",
            order: 4,
            data: [],
        },
    ];
}

export const AVAILABLE_SECTION_TYPES: Array<{ type: string; label: string; icon: string }> = [
    { type: "personal", label: "Informations personnelles", icon: "user" },
    { type: "summary", label: "Résumé professionnel", icon: "file-text" },
    { type: "experience", label: "Expérience", icon: "briefcase" },
    { type: "education", label: "Formation", icon: "graduation-cap" },
    { type: "skills", label: "Compétences", icon: "zap" },
    { type: "languages", label: "Langues", icon: "globe" },
    { type: "certifications", label: "Certifications", icon: "award" },
    { type: "projects", label: "Projets", icon: "code" },
    { type: "references", label: "Références", icon: "users" },
    { type: "custom", label: "Section personnalisée", icon: "plus" },
];
