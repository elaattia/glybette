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

export function createPortfolioTab(label = "About"): PortfolioTab {
    const slug = normalizePortfolioSlug(label) || "section";
    return {
        id: createId("tab"),
        label,
        slug,
        blocks: [],
    };
}

export function createPortfolioIdentity(slug: string): PortfolioIdentity {
    return {
        displayName: slug
            .split("-")
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ") || "Your Name",
        eyebrowText: "Independent portfolio",
        eyebrowPlacement: "above",
    };
}

export function createPortfolioBlock(type: PortfolioBlockType, row = 1): PortfolioBlock {
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
                title: "About me",
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
                data: {
                    markdown:
                        "Write a concise intro. Mention your craft, the problems you like solving, and what makes your work distinct.",
                },
            };
        case "socialLinks":
            return {
                ...base,
                title: "Find me",
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
                title: "Selected projects",
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
                data: {
                    projects: [
                        {
                            title: "Glybette portfolio",
                            summary: "A portfolio system with live editing, templates, and custom URLs.",
                            detail:
                                "Describe the context, your role, technical decisions, and measurable outcome.",
                            url: "https://glybette.com",
                        },
                    ],
                },
            };
        case "experienceTimeline":
            return {
                ...base,
                title: "Experience",
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
                title: "Skills",
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
                title: "Work together",
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
                data: {
                    heading: "Have a role or project in mind?",
                    body: "Send a note and I will reply with availability and next steps.",
                    label: "Contact me",
                    url: "mailto:hello@example.com",
                },
            };
        case "media":
            return {
                ...base,
                title: "Media",
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
                data: {
                    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
                    caption: "Add an external image URL that supports your story.",
                },
            };
        case "customLink":
            return {
                ...base,
                title: "Featured link",
                grid: { column: 1, row, columnSpan: 2, rowSpan: 1 },
                data: { label: "View resume", url: "https://example.com" },
            };
    }
}

export function createStarterPortfolio(slug: string, templateId: PortfolioTemplateId): SavePortfolioRequest {
    const template = getTemplate(templateId);
    const aboutTab = createPortfolioTab("About");
    aboutTab.blocks = [
        createPortfolioBlock("markdown", 1),
        createPortfolioBlock("socialLinks", 1),
        createPortfolioBlock("projectList", 4),
    ];

    return {
        slug,
        identity: createPortfolioIdentity(slug),
        templateId,
        style: template.defaultStyle,
        tabs: [
            aboutTab,
            {
                ...createPortfolioTab("Experience"),
                blocks: [createPortfolioBlock("experienceTimeline", 1), createPortfolioBlock("skills", 1)],
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
