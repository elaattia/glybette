import type { TFunction } from "i18next";
import type { ReactNode } from "react";
import type { AppLocale } from "@/i18n";
import { formatDate } from "@/lib/locale-format";
import type { CvSection, CvSectionType } from "../types/cv.types";
import type { CvTemplateDomain } from "../types/cv.types";
import { getTemplate } from "../templates";

export const CV_BUILDER_NS = "cvBuilder";

export function getSectionLabel(t: TFunction, type: CvSectionType | string): string {
    return t(`sections.defs.${type}`, { defaultValue: type });
}

export function getLocalizedTemplate(t: TFunction, id: string) {
    const base = getTemplate(id);
    return {
        ...base,
        name: t(`templates.items.${id}.name`, { defaultValue: base.name }),
        description: t(`templates.items.${id}.description`, { defaultValue: base.description }),
    };
}

export function getDomainLabel(t: TFunction, domain: CvTemplateDomain): string {
    return t(`templates.domains.${domain}`, { defaultValue: domain });
}

export function getAtsBreakdownLabel(t: TFunction, key: string): string {
    return t(`ats.breakdown.${key}`, { defaultValue: key });
}

export function getAtsScoreLabel(t: TFunction, score: number): string {
    if (score >= 85) return t("ats.scoreLabel.excellent");
    if (score >= 70) return t("ats.scoreLabel.good");
    if (score >= 55) return t("ats.scoreLabel.fair");
    return t("ats.scoreLabel.needsWork");
}

export function formatCvCardTimeAgo(date: Date, t: TFunction, locale: AppLocale): string {
    const diff = Date.now() - date.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return t("card.timeAgo.justNow");
    if (m < 60) return t("card.timeAgo.minutesAgo", { count: m });
    const h = Math.floor(m / 60);
    if (h < 24) return t("card.timeAgo.hoursAgo", { count: h });
    const d = Math.floor(h / 24);
    if (d < 7) return t("card.timeAgo.daysAgo", { count: d });
    return formatDate(date, locale, { day: "numeric", month: "short" });
}

export function getDefaultSkillGroups(t: TFunction): [string, string, string] {
    return [
        t("templates.defaultSkillGroups.hardSkills"),
        t("templates.defaultSkillGroups.softSkills"),
        t("templates.defaultSkillGroups.devOpsTools"),
    ];
}

export function useSectionLabels(t: TFunction) {
    return {
        personalInfo: t("sections.defs.personal-info"),
        summary: t("sections.defs.summary"),
        experience: t("sections.defs.experience"),
        education: t("sections.defs.education"),
        skills: t("sections.defs.skills"),
        projects: t("sections.defs.projects"),
        languages: t("sections.defs.languages"),
        certifications: t("sections.defs.certifications"),
        current: t("sections.experience.currentLabel"),
    };
}

export type SectionDef = {
    type: CvSectionType;
    label: string;
    icon: ReactNode;
    defaultData: CvSection["data"];
};

export function buildSectionDefs(t: TFunction, icons: Record<CvSectionType, ReactNode>): SectionDef[] {
    const types: CvSectionType[] = [
        "personal-info",
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
        "languages",
        "certifications",
    ];
    const defaultData: Record<CvSectionType, CvSection["data"]> = {
        "personal-info": {
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
        summary: { text: "" },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        languages: [],
        certifications: [],
        custom: { title: "", content: "" },
    };
    return types.map((type) => ({
        type,
        label: getSectionLabel(t, type),
        icon: icons[type],
        defaultData: defaultData[type],
    }));
}
