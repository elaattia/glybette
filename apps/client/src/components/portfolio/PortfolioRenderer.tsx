import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { PortfolioBlock, PortfolioDocumentDTO, PortfolioTab } from "@glybette/contracts";
import {
    Dribbble,
    ExternalLink,
    Github,
    Globe,
    Instagram,
    Linkedin,
    Mail,
    Twitter,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTemplate } from "@/lib/portfolio";

export type PortfolioRenderModel = Pick<
    PortfolioDocumentDTO,
    "slug" | "identity" | "templateId" | "style" | "tabs"
>;

type PortfolioRendererProps = {
    portfolio: PortfolioRenderModel;
    activeTabId?: string;
    selectedBlockId?: string | null;
    onTabChange?: (tabId: string) => void;
    onBlockSelect?: (blockId: string) => void;
    renderBlockWrapper?: (
        block: PortfolioBlock,
        content: ReactNode,
        className: string,
        style: CSSProperties,
    ) => ReactNode;
    chrome?: "public" | "builder";
    showGrid?: boolean;
};

type ProjectItem = {
    title?: string;
    summary?: string;
    detail?: string;
    url?: string;
};

const socialIcons: Record<string, LucideIcon> = {
    globe: Globe,
    github: Github,
    linkedin: Linkedin,
    mail: Mail,
    twitter: Twitter,
    instagram: Instagram,
    dribbble: Dribbble,
};

function getString(data: Record<string, unknown>, key: string, fallback = "") {
    const value = data[key];
    return typeof value === "string" ? value : fallback;
}

function getStringArray(data: Record<string, unknown>, key: string) {
    const value = data[key];
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function getObjectArray<T extends Record<string, unknown>>(data: Record<string, unknown>, key: string) {
    const value = data[key];
    return Array.isArray(value)
        ? value.filter((item): item is T => Boolean(item && typeof item === "object" && !Array.isArray(item)))
        : [];
}

function renderMarkdownText(markdown: string) {
    return markdown.split("\n").map((line, index) => (
        <p key={`${line}-${index}`} className="mb-3 last:mb-0">
            {line || "\u00A0"}
        </p>
    ));
}

function blockStyle(): CSSProperties {
    return {};
}

function hexToRgb(value: string) {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
    if (!match) {
        return { r: 22, g: 163, b: 74 };
    }

    return {
        r: Number.parseInt(match[1] ?? "16", 16),
        g: Number.parseInt(match[2] ?? "a3", 16),
        b: Number.parseInt(match[3] ?? "4a", 16),
    };
}

function getContrastColor(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.58 ? "#07110B" : "#FFFFFF";
}

function PortfolioBlockContent({
    block,
    onProjectClick,
}: {
    block: PortfolioBlock;
    onProjectClick: (project: ProjectItem) => void;
}) {
    switch (block.type) {
        case "markdown":
            return (
                <div>
                    <h2 className="mb-4 text-3xl font-semibold tracking-[-0.04em]">{block.title}</h2>
                    <div className="text-sm leading-7 opacity-80">
                        {renderMarkdownText(getString(block.data, "markdown"))}
                    </div>
                </div>
            );
        case "socialLinks": {
            const links = getObjectArray<{ label?: string; url?: string; icon?: string }>(block.data, "links");
            return (
                <div>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] opacity-60">
                        {block.title}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {links.map((link) => (
                            (() => {
                                const Icon = socialIcons[link.icon ?? "globe"] ?? Globe;

                                return (
                                    <a
                                        key={`${link.label}-${link.url}`}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-full border border-[color:color-mix(in_srgb,var(--portfolio-accent)_35%,transparent)] px-3 py-1 text-xs transition hover:border-[var(--portfolio-accent)] hover:text-[var(--portfolio-accent)]"
                                    >
                                        <Icon className="size-3.5" />
                                        {link.label}
                                    </a>
                                );
                            })()
                        ))}
                    </div>
                </div>
            );
        }
        case "projectList": {
            const projects = getObjectArray<ProjectItem>(block.data, "projects");
            return (
                <div>
                    <h2 className="mb-5 text-2xl font-semibold tracking-[-0.035em]">{block.title}</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                        {projects.map((project) => (
                            <button
                                key={`${project.title}-${project.summary}`}
                                type="button"
                                onClick={() => onProjectClick(project)}
                                className="rounded-2xl border border-[color:color-mix(in_srgb,var(--portfolio-accent)_26%,transparent)] bg-[color-mix(in_srgb,var(--portfolio-accent)_8%,transparent)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--portfolio-accent)] hover:bg-[color-mix(in_srgb,var(--portfolio-accent)_16%,transparent)]"
                            >
                                <span className="block text-base font-semibold">{project.title}</span>
                                <span className="mt-2 block text-sm leading-6 opacity-70">{project.summary}</span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        case "experienceTimeline": {
            const items = getObjectArray<{
                role?: string;
                company?: string;
                period?: string;
                description?: string;
            }>(block.data, "items");
            return (
                <div>
                    <h2 className="mb-5 text-2xl font-semibold tracking-[-0.035em]">{block.title}</h2>
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={`${item.role}-${item.company}`} className="border-l border-[var(--portfolio-accent)] pl-4">
                                <p className="text-xs uppercase tracking-[0.24em] text-[var(--portfolio-accent)] opacity-80">{item.period}</p>
                                <p className="mt-1 font-semibold">
                                    {item.role} <span className="opacity-50">@</span> {item.company}
                                </p>
                                <p className="mt-2 text-sm leading-6 opacity-70">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        case "skills":
            return (
                <div>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] opacity-60">
                        {block.title}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {getStringArray(block.data, "skills").map((skill) => (
                            <span key={skill} className="rounded-full bg-[color-mix(in_srgb,var(--portfolio-accent)_18%,transparent)] px-3 py-1 text-xs text-[var(--portfolio-accent)]">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            );
        case "contactCta":
            return (
                <div>
                    <h2 className="text-2xl font-semibold tracking-[-0.035em]">
                        {getString(block.data, "heading")}
                    </h2>
                    <p className="mt-3 text-sm leading-6 opacity-70">{getString(block.data, "body")}</p>
                    <Button
                        className="mt-5 rounded-full bg-[var(--portfolio-accent)] text-[var(--portfolio-accent-contrast)] hover:bg-[color-mix(in_srgb,var(--portfolio-accent)_84%,black)]"
                        asChild
                    >
                        <a href={getString(block.data, "url")}>{getString(block.data, "label", "Contact")}</a>
                    </Button>
                </div>
            );
        case "media":
            return (
                <figure>
                    <img
                        src={getString(block.data, "imageUrl")}
                        alt={getString(block.data, "caption", block.title ?? "Portfolio media")}
                        className="aspect-[4/3] w-full rounded-[inherit] object-cover"
                    />
                    <figcaption className="mt-3 text-xs opacity-60">{getString(block.data, "caption")}</figcaption>
                </figure>
            );
        case "customLink":
            return (
                <a
                    href={getString(block.data, "url")}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 text-lg font-semibold text-[var(--portfolio-accent)]"
                >
                    {getString(block.data, "label", block.title ?? "Open link")}
                    <ExternalLink className="size-4" />
                </a>
            );
    }
}

export function PortfolioRenderer({
    portfolio,
    activeTabId,
    selectedBlockId,
    onTabChange,
    onBlockSelect,
    renderBlockWrapper,
    chrome = "public",
    showGrid = false,
}: PortfolioRendererProps) {
    const [project, setProject] = useState<ProjectItem | null>(null);
    const template = getTemplate(portfolio.templateId);
    const accentContrast = useMemo(
        () => getContrastColor(portfolio.style.accentColor),
        [portfolio.style.accentColor],
    );
    const identity = portfolio.identity ?? {
        displayName: portfolio.slug,
        eyebrowText: "Independent portfolio",
        eyebrowPlacement: "above" as const,
    };
    const activeTab = useMemo<PortfolioTab | undefined>(
        () => portfolio.tabs.find((tab) => tab.id === activeTabId) ?? portfolio.tabs[0],
        [activeTabId, portfolio.tabs],
    );
    const radius =
        portfolio.style.radius === "sharp"
            ? "rounded-none"
            : portfolio.style.radius === "round"
              ? "rounded-[2rem]"
              : "rounded-3xl";

    return (
        <div
            className={cn(
                "relative isolate min-h-full",
                template.previewClassName,
                chrome === "builder" ? "h-full overflow-y-auto" : "min-h-screen overflow-hidden",
            )}
            style={{
                "--portfolio-accent": portfolio.style.accentColor,
                "--portfolio-accent-contrast": accentContrast,
                fontFamily: portfolio.style.fontFamily,
            } as CSSProperties}
        >
            <div className={cn("pointer-events-none absolute inset-0 -z-10 opacity-35", template.backgroundArtClassName)} />
            <main
                className={cn(
                    "relative mx-auto flex min-h-full w-full max-w-6xl flex-col px-5 py-8 md:px-10 md:py-12",
                    template.layout === "mono" && "max-w-none",
                )}
            >
                <header
                    className={cn(
                        "mb-8 border-current/10 pb-6",
                        template.layout === "editorial" &&
                            "grid gap-6 border-b md:grid-cols-1",
                        template.layout === "signal" &&
                            "rounded-2xl border border-current/15 bg-black/20 p-4 shadow-2xl shadow-black/20",
                        template.layout === "bloom" &&
                            "mx-auto max-w-3xl text-center",
                        template.layout === "mono" &&
                            "grid gap-3 border-y-4 border-current py-5 md:grid-cols-[18rem_minmax(0,1fr)]",
                    )}
                >
                    <div
                        className={cn(
                            template.layout === "signal" && "rounded-xl border border-current/10 p-4",
                            template.layout === "mono" && "md:col-start-2",
                        )}
                    >
                        {identity.eyebrowPlacement === "above" ? (
                            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--portfolio-accent)]">
                                {identity.eyebrowText}
                            </p>
                        ) : null}
                        <h1
                            className={cn(
                                "text-5xl font-semibold tracking-[-0.07em] md:text-7xl",
                                identity.eyebrowPlacement === "above" && "mt-3",
                                template.layout === "signal" && "font-mono text-4xl uppercase tracking-[-0.04em] md:text-6xl",
                                template.layout === "bloom" && "text-6xl md:text-8xl",
                                template.layout === "mono" && "text-6xl uppercase leading-none md:text-8xl",
                            )}
                        >
                            {identity.displayName}
                        </h1>
                        {identity.eyebrowPlacement === "below" ? (
                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.4em] text-[var(--portfolio-accent)]">
                                {identity.eyebrowText}
                            </p>
                        ) : null}
                    </div>
                    <nav
                        className={cn(
                            "flex flex-wrap gap-2",
                            template.layout === "editorial" && "mt-2 max-w-full justify-start border-t border-current/10 pt-4",
                            template.layout === "signal" && "mt-4",
                            template.layout === "bloom" && "mt-6 justify-center",
                            template.layout === "mono" && "md:row-start-1 md:flex-col",
                        )}
                    >
                        {portfolio.tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onTabChange?.(tab.id)}
                                className={cn(
                                    "rounded-full border px-4 py-2 text-sm transition",
                                    template.layout === "signal" && "rounded-md font-mono uppercase",
                                    template.layout === "mono" && "rounded-none border-current/60 font-semibold uppercase",
                                    activeTab?.id === tab.id
                                        ? "border-transparent bg-[var(--portfolio-accent)] text-[var(--portfolio-accent-contrast)]"
                                        : "border-current/15 hover:border-current/40",
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </header>

                <section
                    className={cn(
                        "relative grid grid-cols-1 gap-4 rounded-[2rem] transition md:grid-cols-2",
                        showGrid &&
                            "outline outline-1 outline-white/20 [background-image:linear-gradient(90deg,transparent_calc(50%_-_1px),rgba(255,255,255,0.24)_calc(50%_-_1px),rgba(255,255,255,0.24)_calc(50%_+_1px),transparent_calc(50%_+_1px))]",
                    )}
                >
                    {(activeTab?.blocks ?? []).map((block) => {
                        const className = cn(
                            "group/card relative col-span-1 min-w-0 overflow-hidden border p-5 shadow-2xl shadow-black/10 backdrop-blur",
                            block.grid.columnSpan === 2 && "md:col-span-2",
                            radius,
                            template.surfaceClassName,
                            "border-[color:color-mix(in_srgb,var(--portfolio-accent)_32%,transparent)] bg-[color-mix(in_srgb,var(--portfolio-accent)_10%,transparent)]",
                            template.layout === "signal" && "rounded-xl font-mono shadow-[inset_0_0_0_1px_rgba(56,189,248,0.08)]",
                            template.layout === "bloom" && "shadow-[0_24px_60px_rgba(217,119,6,0.12)]",
                            template.layout === "mono" && "rounded-none border-2 p-4 shadow-none",
                            selectedBlockId === block.id && "outline outline-2 outline-[var(--portfolio-accent)]",
                            onBlockSelect && "cursor-pointer",
                        );
                        const style = blockStyle();
                        const content = (
                            <PortfolioBlockContent block={block} onProjectClick={(item) => setProject(item)} />
                        );

                        if (renderBlockWrapper) {
                            return renderBlockWrapper(block, content, className, style);
                        }

                        return (
                            <article key={block.id} className={className} style={style}>
                                {content}
                            </article>
                        );
                    })}
                </section>

                <footer className="relative mt-auto pt-10 text-center text-xs uppercase tracking-[0.35em] opacity-55">
                    Powered by GLYBETTE
                </footer>
            </main>

            {project ? (
                <div
                    className={cn(
                        "inset-0 z-50 grid place-items-center bg-black/70 p-5",
                        chrome === "builder" ? "absolute" : "fixed",
                    )}
                    role="dialog"
                >
                    <div className={cn("max-w-lg border p-6", radius, template.surfaceClassName)}>
                        <p className="text-xs uppercase tracking-[0.3em] text-[var(--portfolio-accent)]">
                            Project detail
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{project.title}</h2>
                        <p className="mt-4 text-sm leading-7 opacity-75">{project.detail ?? project.summary}</p>
                        <div className="mt-6 flex gap-2">
                            {project.url ? (
                                <Button
                                    className="bg-[var(--portfolio-accent)] text-[var(--portfolio-accent-contrast)] hover:bg-[color-mix(in_srgb,var(--portfolio-accent)_84%,black)]"
                                    asChild
                                >
                                    <a href={project.url} target="_blank" rel="noreferrer">
                                        Open project
                                    </a>
                                </Button>
                            ) : null}
                            <Button variant="outline" onClick={() => setProject(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
