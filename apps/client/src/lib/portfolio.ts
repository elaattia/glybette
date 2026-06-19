import type { TFunction } from "i18next";
import type {
    PortfolioBlock,
    PortfolioBlockType,
    PortfolioDocumentDTO,
    PortfolioIdentity,
    PortfolioTab,
    PortfolioTemplateId,
    SavePortfolioRequest,
} from "@glybette/contracts";
import { getTemplate } from "@/components/portfolio/template-config";

function tr(t: TFunction | undefined, key: string, fallback: string): string {
    return t ? t(key, { defaultValue: fallback }) : fallback;
}

export { getTemplate, portfolioTemplates } from "@/components/portfolio/template-config";
export type { PortfolioTemplateDefinition } from "@/components/portfolio/template-config";

export const blockLibrary: Array<{
    type: PortfolioBlockType;
    label: string;
    description: string;
}> = [
    {
        type: "markdown",
        label: "Markdown / About",
        description: "Rich text for introductions, essays, and case-study notes.",
    },
    {
        type: "socialLinks",
        label: "Social links",
        description: "A compact row of profile links and contact destinations.",
    },
    {
        type: "projectList",
        label: "Project cards",
        description: "Project summaries that open detailed modal views.",
    },
    {
        type: "experienceTimeline",
        label: "Experience timeline",
        description: "Chronological roles, milestones, and highlights.",
    },
    {
        type: "skills",
        label: "Skills badges",
        description: "Tagged capabilities grouped into a scannable block.",
    },
    {
        type: "contactCta",
        label: "Contact CTA",
        description: "A prominent invitation to reach out.",
    },
    {
        type: "media",
        label: "Image / media",
        description: "External image URL with caption support.",
    },
    {
        type: "customLink",
        label: "Custom button",
        description: "A single link or download-style call to action.",
    },
];

export function normalizePortfolioSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function createId(prefix: string) {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createPortfolioTab(label = "About", _t?: TFunction): PortfolioTab {
    const slug = normalizePortfolioSlug(label) || "section";
    return {
        id: createId("tab"),
        label,
        slug,
        blocks: [],
    };
}

export function createPortfolioIdentity(slug: string, t?: TFunction): PortfolioIdentity {
    return {
        displayName:
            slug
                .split("-")
                .filter(Boolean)
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ") || tr(t, "blocks.defaults.displayNameFallback", "Your Name"),
        eyebrowText: tr(t, "blocks.defaults.eyebrowText", "Independent portfolio"),
        eyebrowPlacement: "above",
    };
}

export function createPortfolioBlock(type: PortfolioBlockType, row = 1, t?: TFunction): PortfolioBlock {
    const base = {
        id: createId("block"),
        type,
        source: { kind: "manual" as const },
        grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
    };

    switch (type) {
        case "markdown":
            return {
                ...base,
                title: tr(t, "blocks.defaults.markdownTitle", "About me"),
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
                data: {
                    markdown: tr(
                        t,
                        "blocks.defaults.markdownBody",
                        "Write a concise intro. Mention your craft, the problems you like solving, and what makes your work distinct.",
                    ),
                },
            };
        case "socialLinks":
            return {
                ...base,
                title: tr(t, "blocks.defaults.socialLinksTitle", "Find me"),
                data: {
                    links: [
                        { label: "GitHub", url: "https://github.com/", icon: "github" },
                        { label: "LinkedIn", url: "https://linkedin.com/", icon: "linkedin" },
                    ],
                },
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
            };
        case "projectList":
            return {
                ...base,
                title: tr(t, "blocks.defaults.projectListTitle", "Selected projects"),
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
                data: {
                    projects: [
                        {
                            title: "Glybette portfolio",
                            summary: "A portfolio system with live editing, templates, and custom URLs.",
                            detail: "Describe the context, your role, technical decisions, and measurable outcome.",
                            url: "https://glybette.com",
                        },
                    ],
                },
            };
        case "experienceTimeline":
            return {
                ...base,
                title: tr(t, "blocks.defaults.experienceTitle", "Experience"),
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
                data: {
                    items: [
                        {
                            role: "Product Engineer",
                            company: "Your company",
                            period: "2024 - Present",
                            description: "Built product surfaces that connect design quality with reliable systems.",
                        },
                    ],
                },
            };
        case "skills":
            return {
                ...base,
                title: tr(t, "blocks.defaults.skillsTitle", "Skills"),
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
                data: {
                    skills: ["React", "TypeScript", "Product thinking", "APIs"],
                    skillGroups: [
                        { label: "Engineering", skills: ["React", "TypeScript", "APIs"] },
                        { label: "Product", skills: ["Product thinking", "Systems design"] },
                    ],
                },
            };
        case "contactCta":
            return {
                ...base,
                title: tr(t, "blocks.defaults.contactCtaTitle", "Work together"),
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
                data: {
                    heading: tr(t, "blocks.defaults.contactCtaHeading", "Have a role or project in mind?"),
                    body: tr(t, "blocks.defaults.contactCtaBody", "Send a note and I will reply with availability and next steps."),
                    label: tr(t, "blocks.defaults.contactCtaLabel", "Contact me"),
                    url: "mailto:hello@example.com",
                },
            };
        case "media":
            return {
                ...base,
                title: tr(t, "blocks.defaults.mediaTitle", "Media"),
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
                data: {
                    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
                    caption: tr(t, "blocks.defaults.mediaCaption", "Add an external image URL that supports your story."),
                },
            };
        case "customLink":
            return {
                ...base,
                title: tr(t, "blocks.defaults.customLinkTitle", "Featured link"),
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
                data: { label: tr(t, "blocks.defaults.customLinkLabel", "View resume"), url: "https://example.com" },
            };
    }
}

export function createStarterPortfolio(slug: string, templateId: PortfolioTemplateId, t?: TFunction): SavePortfolioRequest {
    const template = getTemplate(templateId);
    const aboutTab = createPortfolioTab(tr(t, "blocks.defaults.tabAbout", "About"), t);
    aboutTab.blocks = [
        createPortfolioBlock("markdown", 1, t),
        createPortfolioBlock("socialLinks", 1, t),
        createPortfolioBlock("projectList", 4, t),
    ];

    return {
        slug,
        identity: createPortfolioIdentity(slug, t),
        templateId,
        style: template.defaultStyle,
        tabs: [
            aboutTab,
            {
                ...createPortfolioTab(tr(t, "blocks.defaults.tabExperience", "Experience"), t),
                blocks: [createPortfolioBlock("experienceTimeline", 1, t), createPortfolioBlock("skills", 1, t)],
            },
        ],
    };
}

export function toSaveRequest(portfolio: PortfolioDocumentDTO): SavePortfolioRequest {
    return {
        slug: portfolio.slug,
        identity: portfolio.identity ?? createPortfolioIdentity(portfolio.slug),
        templateId: portfolio.templateId,
        style: portfolio.style,
        tabs: portfolio.tabs,
    };
}
