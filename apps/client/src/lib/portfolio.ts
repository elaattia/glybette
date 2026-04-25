import type {
    PortfolioBlock,
    PortfolioBlockType,
    PortfolioDocumentDTO,
    PortfolioIdentity,
    PortfolioStyle,
    PortfolioTab,
    PortfolioTemplateId,
    SavePortfolioRequest,
} from "@glybette/contracts";

export type PortfolioTemplateDefinition = {
    id: PortfolioTemplateId;
    name: string;
    tone: string;
    description: string;
    columns: number;
    defaultStyle: PortfolioStyle;
    previewClassName: string;
    surfaceClassName: string;
    accentClassName: string;
    layout: "editorial" | "signal" | "bloom" | "mono";
    backgroundArtClassName: string;
};

export const portfolioTemplates: PortfolioTemplateDefinition[] = [
    {
        id: "atelier",
        name: "Atelier Ledger",
        tone: "Editorial, focused, quietly luxurious",
        description: "A magazine-like portfolio with generous type, calm panels, and sharp project storytelling.",
        columns: 2,
        defaultStyle: {
            theme: "dark",
            accentColor: "#16A34A",
            fontFamily: "Bricolage Grotesque",
            radius: "soft",
        },
        previewClassName: "bg-[#101714] text-[#F4F0E8]",
        surfaceClassName: "border-[#D9FF8F]/15 bg-[#F4F0E8]/7",
        accentClassName: "text-[#C8FF69]",
        layout: "editorial",
        backgroundArtClassName:
            "bg-[radial-gradient(circle_at_18%_12%,var(--portfolio-accent),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_36%),linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.08)_50%,transparent_51%)]",
    },
    {
        id: "signal",
        name: "Signal Grid",
        tone: "Industrial, technical, high-contrast",
        description: "A dense grid for builders who want the portfolio to feel like a control room.",
        columns: 2,
        defaultStyle: {
            theme: "dark",
            accentColor: "#38BDF8",
            fontFamily: "DM Sans",
            radius: "sharp",
        },
        previewClassName: "bg-[#070A0F] text-[#E8F4FF]",
        surfaceClassName: "border-[#38BDF8]/20 bg-[#0D1420]",
        accentClassName: "text-[#38BDF8]",
        layout: "signal",
        backgroundArtClassName:
            "bg-[linear-gradient(rgba(56,189,248,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.12)_1px,transparent_1px),radial-gradient(circle_at_80%_15%,var(--portfolio-accent),transparent_18%)] bg-[size:36px_36px,36px_36px,auto]",
    },
    {
        id: "folio",
        name: "Folio Bloom",
        tone: "Soft, warm, personable",
        description: "A lighter portfolio for profiles that need warmth, clarity, and an approachable rhythm.",
        columns: 2,
        defaultStyle: {
            theme: "light",
            accentColor: "#D97706",
            fontFamily: "DM Sans",
            radius: "round",
        },
        previewClassName: "bg-[#FFF7ED] text-[#29180A]",
        surfaceClassName: "border-[#D97706]/20 bg-white/70",
        accentClassName: "text-[#B45309]",
        layout: "bloom",
        backgroundArtClassName:
            "bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_85%_22%,var(--portfolio-accent),transparent_18%),radial-gradient(circle_at_12%_70%,#FED7AA,transparent_24%)]",
    },
    {
        id: "mono",
        name: "Mono Dispatch",
        tone: "Brutalist, compact, sharply typographic",
        description: "A stripped-back profile for technical specialists who want proof, links, and signal fast.",
        columns: 2,
        defaultStyle: {
            theme: "light",
            accentColor: "#111827",
            fontFamily: "Bricolage Grotesque",
            radius: "sharp",
        },
        previewClassName: "bg-[#F6F1E7] text-[#111827]",
        surfaceClassName: "border-[#111827]/25 bg-[#FFFDF7]",
        accentClassName: "text-[#111827]",
        layout: "mono",
        backgroundArtClassName:
            "bg-[linear-gradient(90deg,rgba(17,24,39,0.16)_1px,transparent_1px),linear-gradient(rgba(17,24,39,0.16)_1px,transparent_1px)] bg-[size:18px_18px]",
    },
];

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

export function getTemplate(templateId: PortfolioTemplateId) {
    return portfolioTemplates.find((template) => template.id === templateId) ?? portfolioTemplates[0];
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
                data: { skills: ["React", "TypeScript", "Product thinking", "APIs"] },
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

export function portfolioLocalStorageKey(userId: string, slug: string) {
    return `glybette:portfolio:${userId}:${slug || "new"}`;
}
