import type { TFunction } from "i18next";
import type { PortfolioBlockType, PortfolioTemplateId } from "@glybette/contracts";
import { socialIconOptions as baseSocialIconOptions } from "@/components/portfolio/social-icons";
import {
    getTemplate,
    portfolioTemplates,
    type PortfolioTemplateDefinition,
} from "@/components/portfolio/template-config";

export const PORTFOLIO_NS = "portfolio";

const BLOCK_LIBRARY_TYPES: PortfolioBlockType[] = [
    "markdown",
    "socialLinks",
    "projectList",
    "experienceTimeline",
    "skills",
    "contactCta",
    "media",
    "customLink",
];

const BLOCK_LIBRARY_KEYS: Record<PortfolioBlockType, string> = {
    markdown: "markdown",
    socialLinks: "socialLinks",
    projectList: "projectList",
    experienceTimeline: "experienceTimeline",
    skills: "skills",
    contactCta: "contactCta",
    media: "media",
    customLink: "customLink",
};

const SOCIAL_ICON_LABEL_KEYS: Record<string, string> = {
    globe: "website",
    github: "github",
    linkedin: "linkedin",
    mail: "email",
    twitter: "twitter",
    instagram: "instagram",
    dribbble: "dribbble",
};

export function getLocalizedTemplate(t: TFunction, templateId: PortfolioTemplateId): PortfolioTemplateDefinition {
    const base = getTemplate(templateId);
    return {
        ...base,
        name: t(`templates.${base.id}.name`, { defaultValue: base.name }),
        tone: t(`templates.${base.id}.tone`, { defaultValue: base.tone }),
        description: t(`templates.${base.id}.description`, { defaultValue: base.description }),
    };
}

export function getLocalizedTemplates(t: TFunction): PortfolioTemplateDefinition[] {
    return portfolioTemplates.map((template) => getLocalizedTemplate(t, template.id));
}

export function getBlockLibrary(t: TFunction) {
    return BLOCK_LIBRARY_TYPES.map((type) => ({
        type,
        label: t(`blocks.library.${BLOCK_LIBRARY_KEYS[type]}.label`),
        description: t(`blocks.library.${BLOCK_LIBRARY_KEYS[type]}.description`),
    }));
}

export function getSocialIconOptions(t: TFunction) {
    return baseSocialIconOptions.map((option) => ({
        ...option,
        label: t(`socialIcons.${SOCIAL_ICON_LABEL_KEYS[option.value] ?? option.value}`, {
            defaultValue: option.label,
        }),
    }));
}
