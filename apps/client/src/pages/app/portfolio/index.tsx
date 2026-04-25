import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
    closestCenter,
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
    PortfolioBlock,
    PortfolioBlockType,
    PortfolioTab,
    PortfolioTemplateId,
    SavePortfolioRequest,
} from "@glybette/contracts";
import {
    Check,
    Dribbble,
    Github,
    GripVertical,
    Instagram,
    LayoutTemplate,
    Linkedin,
    Loader2,
    Mail,
    Palette,
    Plus,
    Rows2,
    Save,
    Sparkles,
    Trash2,
    Twitter,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PortfolioRenderer } from "@/components/portfolio/PortfolioRenderer";
import { usePortfolioMutations, useCurrentPortfolio } from "@/hooks/usePortfolio";
import { useUser } from "@/hooks/useUser";
import {
    blockLibrary,
    createPortfolioBlock,
    createPortfolioIdentity,
    createPortfolioTab,
    createStarterPortfolio,
    normalizePortfolioSlug,
    portfolioLocalStorageKey,
    portfolioTemplates,
    toSaveRequest,
} from "@/lib/portfolio";
import { cn } from "@/lib/utils";

type BuilderStep = "slug" | "template" | "editor";

const socialIconOptions: Array<{ value: string; label: string; Icon: LucideIcon }> = [
    { value: "globe", label: "Website", Icon: Sparkles },
    { value: "github", label: "GitHub", Icon: Github },
    { value: "linkedin", label: "LinkedIn", Icon: Linkedin },
    { value: "mail", label: "Email", Icon: Mail },
    { value: "twitter", label: "Twitter / X", Icon: Twitter },
    { value: "instagram", label: "Instagram", Icon: Instagram },
    { value: "dribbble", label: "Dribbble", Icon: Dribbble },
];

function publicUrlFor(slug: string, isPremium: boolean) {
    return isPremium ? `https://${slug}.glybette.com` : `https://glybette.com/user/${slug}`;
}

function premiumUrlFor(slug: string) {
    return `https://${slug || "name"}.glybette.com`;
}

function reflowBlocks(blocks: PortfolioBlock[]) {
    return blocks.map((block, index) => ({
        ...block,
        grid: {
            ...block.grid,
            column: 1,
            row: index + 1,
            columnSpan: block.grid.columnSpan === 2 ? 2 : 1,
            rowSpan: 1,
        },
    }));
}

function normalizeDraftGrid(draft: SavePortfolioRequest): SavePortfolioRequest {
    const slug = normalizePortfolioSlug(draft.slug);
    return {
        ...draft,
        slug,
        identity: draft.identity ?? createPortfolioIdentity(slug),
        tabs: draft.tabs.map((tab) => ({
            ...tab,
            blocks: reflowBlocks(tab.blocks),
        })),
    };
}

function getText(data: Record<string, unknown>, key: string, fallback = "") {
    const value = data[key];
    return typeof value === "string" ? value : fallback;
}

function getStringList(data: Record<string, unknown>, key: string) {
    const value = data[key];
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function getObjectList<T extends Record<string, unknown>>(data: Record<string, unknown>, key: string) {
    const value = data[key];
    return Array.isArray(value)
        ? value.filter((item): item is T => Boolean(item && typeof item === "object" && !Array.isArray(item)))
        : [];
}

function InspectorField({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
        </div>
    );
}

function BlockDataFields({
    block,
    onChange,
}: {
    block: PortfolioBlock;
    onChange: (data: Record<string, unknown>) => void;
}) {
    const updateField = (key: string, value: unknown) => {
        onChange({ ...block.data, [key]: value });
    };

    if (block.type === "markdown") {
        return (
            <InspectorField label="Markdown text">
                <Textarea
                    value={getText(block.data, "markdown")}
                    onChange={(event) => updateField("markdown", event.target.value)}
                    className="min-h-44"
                />
            </InspectorField>
        );
    }

    if (block.type === "skills") {
        return (
            <InspectorField label="Skills">
                <Textarea
                    value={getStringList(block.data, "skills").join(", ")}
                    onChange={(event) =>
                        updateField(
                            "skills",
                            event.target.value
                                .split(",")
                                .map((skill) => skill.trim())
                                .filter(Boolean),
                        )
                    }
                    placeholder="React, TypeScript, APIs"
                />
            </InspectorField>
        );
    }

    if (block.type === "contactCta") {
        return (
            <>
                <InspectorField label="Heading">
                    <Input
                        value={getText(block.data, "heading")}
                        onChange={(event) => updateField("heading", event.target.value)}
                    />
                </InspectorField>
                <InspectorField label="Body">
                    <Textarea
                        value={getText(block.data, "body")}
                        onChange={(event) => updateField("body", event.target.value)}
                    />
                </InspectorField>
                <InspectorField label="Button label">
                    <Input
                        value={getText(block.data, "label")}
                        onChange={(event) => updateField("label", event.target.value)}
                    />
                </InspectorField>
                <InspectorField label="Button URL">
                    <Input
                        value={getText(block.data, "url")}
                        onChange={(event) => updateField("url", event.target.value)}
                    />
                </InspectorField>
            </>
        );
    }

    if (block.type === "media") {
        return (
            <>
                <InspectorField label="Image URL">
                    <Input
                        value={getText(block.data, "imageUrl")}
                        onChange={(event) => updateField("imageUrl", event.target.value)}
                    />
                </InspectorField>
                <InspectorField label="Caption">
                    <Input
                        value={getText(block.data, "caption")}
                        onChange={(event) => updateField("caption", event.target.value)}
                    />
                </InspectorField>
            </>
        );
    }

    if (block.type === "customLink") {
        return (
            <>
                <InspectorField label="Link label">
                    <Input
                        value={getText(block.data, "label")}
                        onChange={(event) => updateField("label", event.target.value)}
                    />
                </InspectorField>
                <InspectorField label="URL">
                    <Input
                        value={getText(block.data, "url")}
                        onChange={(event) => updateField("url", event.target.value)}
                    />
                </InspectorField>
            </>
        );
    }

    if (block.type === "socialLinks") {
        const links = getObjectList<{ label?: string; url?: string; icon?: string }>(block.data, "links");
        const updateLink = (index: number, field: "label" | "url" | "icon", value: string) => {
            updateField(
                "links",
                links.map((link, linkIndex) => (linkIndex === index ? { ...link, [field]: value } : link)),
            );
        };

        return (
            <div className="space-y-3">
                {links.map((link, index) => (
                    <div key={`${link.label}-${index}`} className="space-y-2 rounded-xl border border-[var(--gb-border)] p-3">
                        <Input
                            value={link.label ?? ""}
                            onChange={(event) => updateLink(index, "label", event.target.value)}
                            placeholder="Label"
                        />
                        <Input
                            value={link.url ?? ""}
                            onChange={(event) => updateLink(index, "url", event.target.value)}
                            placeholder="https://"
                        />
                        <Select
                            value={link.icon ?? "globe"}
                            onValueChange={(value) => updateLink(index, "icon", value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {socialIconOptions.map(({ value, label, Icon }) => (
                                    <SelectItem key={value} value={value}>
                                        <span className="flex items-center gap-2">
                                            <Icon className="size-3.5" />
                                            {label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => updateField("links", [...links, { label: "New link", url: "https://", icon: "globe" }])}
                >
                    Add link
                </Button>
            </div>
        );
    }

    if (block.type === "projectList") {
        const projects = getObjectList<{
            title?: string;
            summary?: string;
            detail?: string;
            url?: string;
        }>(block.data, "projects");
        const updateProject = (index: number, field: "title" | "summary" | "detail" | "url", value: string) => {
            updateField(
                "projects",
                projects.map((project, projectIndex) =>
                    projectIndex === index ? { ...project, [field]: value } : project,
                ),
            );
        };

        return (
            <div className="space-y-3">
                {projects.map((project, index) => (
                    <div key={`${project.title}-${index}`} className="space-y-2 rounded-xl border border-[var(--gb-border)] p-3">
                        <Input value={project.title ?? ""} onChange={(event) => updateProject(index, "title", event.target.value)} placeholder="Project title" />
                        <Input value={project.summary ?? ""} onChange={(event) => updateProject(index, "summary", event.target.value)} placeholder="Short summary" />
                        <Textarea value={project.detail ?? ""} onChange={(event) => updateProject(index, "detail", event.target.value)} placeholder="Modal detail" />
                        <Input value={project.url ?? ""} onChange={(event) => updateProject(index, "url", event.target.value)} placeholder="Project URL" />
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                        updateField("projects", [
                            ...projects,
                            { title: "New project", summary: "Short outcome", detail: "What changed?", url: "" },
                        ])
                    }
                >
                    Add project
                </Button>
            </div>
        );
    }

    const items = getObjectList<{
        role?: string;
        company?: string;
        period?: string;
        description?: string;
    }>(block.data, "items");
    const updateItem = (index: number, field: "role" | "company" | "period" | "description", value: string) => {
        updateField(
            "items",
            items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
        );
    };

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={`${item.role}-${index}`} className="space-y-2 rounded-xl border border-[var(--gb-border)] p-3">
                    <Input value={item.role ?? ""} onChange={(event) => updateItem(index, "role", event.target.value)} placeholder="Role" />
                    <Input value={item.company ?? ""} onChange={(event) => updateItem(index, "company", event.target.value)} placeholder="Company" />
                    <Input value={item.period ?? ""} onChange={(event) => updateItem(index, "period", event.target.value)} placeholder="2024 - Present" />
                    <Textarea value={item.description ?? ""} onChange={(event) => updateItem(index, "description", event.target.value)} placeholder="What you did" />
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                    updateField("items", [
                        ...items,
                        { role: "New role", company: "Company", period: "Year", description: "Impact" },
                    ])
                }
            >
                Add experience
            </Button>
        </div>
    );
}

function SortableBlockShell({
    block,
    children,
    className,
    style,
    onSelect,
}: {
    block: PortfolioBlock;
    children: ReactNode;
    className: string;
    style: CSSProperties;
    onSelect: (blockId: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: block.id,
    });
    const stableTransform = transform
        ? {
              ...transform,
              scaleX: 1,
              scaleY: 1,
          }
        : null;

    return (
        <article
            ref={setNodeRef}
            className={cn(
                className,
                "transition-[transform,box-shadow,border-color,opacity] duration-200 ease-out",
                isDragging && "z-20 opacity-80 shadow-2xl ring-2 ring-[var(--portfolio-accent)]",
            )}
            style={{
                ...style,
                transform: CSS.Transform.toString(stableTransform),
                transition: transition ?? "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
            onClick={() => onSelect(block.id)}
        >
            <button
                type="button"
                className="absolute right-3 top-3 z-10 grid size-8 touch-none cursor-grab place-items-center rounded-full border border-current/15 bg-black/25 text-current/70 opacity-0 backdrop-blur transition hover:text-current group-hover/card:opacity-100 active:cursor-grabbing"
                aria-label="Drag block to reorder"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="size-4" />
            </button>
            {children}
        </article>
    );
}

export default function PortfolioBuilderPage() {
    const { user } = useUser();
    const currentPortfolio = useCurrentPortfolio();
    const mutations = usePortfolioMutations();
    const [step, setStep] = useState<BuilderStep>("slug");
    const [slugInput, setSlugInput] = useState("");
    const [slugMessage, setSlugMessage] = useState("");
    const [draft, setDraft] = useState<SavePortfolioRequest | null>(null);
    const [activeTabId, setActiveTabId] = useState<string | undefined>();
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [localSavedAt, setLocalSavedAt] = useState<string | null>(null);
    const [isDraggingBlock, setIsDraggingBlock] = useState(false);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
    );

    const activeTab = useMemo(
        () => draft?.tabs.find((tab) => tab.id === activeTabId) ?? draft?.tabs[0],
        [activeTabId, draft?.tabs],
    );
    const selectedBlock = useMemo(
        () => activeTab?.blocks.find((block) => block.id === selectedBlockId) ?? null,
        [activeTab?.blocks, selectedBlockId],
    );

    useEffect(() => {
        if (!user || currentPortfolio.isPending || draft) {
            return;
        }

        const remote = currentPortfolio.data?.portfolio;
        if (!remote) {
            setStep("slug");
            return;
        }

        const remoteDraft = toSaveRequest(remote);
        const key = portfolioLocalStorageKey(user.id, remote.slug);
        const local = window.localStorage.getItem(key);
        if (local && local !== JSON.stringify(remoteDraft)) {
            setDraft(normalizeDraftGrid(JSON.parse(local) as SavePortfolioRequest));
        } else {
            setDraft(normalizeDraftGrid(remoteDraft));
        }
        setSlugInput(remote.slug);
        setActiveTabId(remote.tabs[0]?.id);
        setStep("editor");
    }, [currentPortfolio.data?.portfolio, currentPortfolio.isPending, draft, user]);

    useEffect(() => {
        if (!draft || !user) {
            return;
        }
        const key = portfolioLocalStorageKey(user.id, draft.slug);
        window.localStorage.setItem(key, JSON.stringify(draft));
        setLocalSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, [draft, user]);

    const updateDraft = (updater: (draft: SavePortfolioRequest) => SavePortfolioRequest) => {
        setDraft((current) => (current ? updater(current) : current));
    };

    const updateActiveTab = (updater: (tab: PortfolioTab) => PortfolioTab) => {
        updateDraft((current) => ({
            ...current,
            tabs: current.tabs.map((tab) => (tab.id === activeTab?.id ? updater(tab) : tab)),
        }));
    };

    const updateSelectedBlock = (updater: (block: PortfolioBlock) => PortfolioBlock) => {
        updateActiveTab((tab) => ({
            ...tab,
            blocks: tab.blocks.map((block) => (block.id === selectedBlockId ? updater(block) : block)),
        }));
    };

    const handleSlugContinue = async () => {
        const slug = normalizePortfolioSlug(slugInput);
        setSlugInput(slug);
        setSlugMessage("");
        const availability = await mutations.checkSlug.mutateAsync(slug);
        if (!availability.available) {
            setSlugMessage("That portfolio URL is already taken.");
            return;
        }
        await mutations.setSlug.mutateAsync(slug);
        setStep("template");
    };

    const chooseTemplate = (templateId: PortfolioTemplateId) => {
        const nextDraft = createStarterPortfolio(normalizePortfolioSlug(slugInput), templateId);
        setDraft(nextDraft);
        setActiveTabId(nextDraft.tabs[0]?.id);
        setSelectedBlockId(nextDraft.tabs[0]?.blocks[0]?.id ?? null);
        setStep("editor");
    };

    const applyTemplate = (templateId: PortfolioTemplateId) => {
        const template = portfolioTemplates.find((item) => item.id === templateId);
        if (!template) {
            return;
        }
        updateDraft((current) => ({
            ...current,
            templateId,
            style: template.defaultStyle,
        }));
    };

    const addBlock = (type: PortfolioBlockType) => {
        if (!activeTab) {
            return;
        }
        const block = createPortfolioBlock(type, activeTab.blocks.length + 1);
        updateActiveTab((tab) => ({ ...tab, blocks: [...tab.blocks, block] }));
        setSelectedBlockId(block.id);
    };

    const addTab = () => {
        const tab = createPortfolioTab("Custom tab");
        updateDraft((current) => ({ ...current, tabs: [...current.tabs, tab] }));
        setActiveTabId(tab.id);
        setSelectedBlockId(null);
    };

    const deleteSelectedBlock = () => {
        if (!selectedBlockId) {
            return;
        }

        updateActiveTab((tab) => {
            const blocks = tab.blocks.filter((block) => block.id !== selectedBlockId);
            return {
                ...tab,
                blocks: reflowBlocks(blocks),
            };
        });
        setSelectedBlockId(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setIsDraggingBlock(false);
        const { active, over } = event;
        if (!over || active.id === over.id || !activeTab) {
            return;
        }
        const oldIndex = activeTab.blocks.findIndex((block) => block.id === active.id);
        const newIndex = activeTab.blocks.findIndex((block) => block.id === over.id);
        if (oldIndex < 0 || newIndex < 0) {
            return;
        }

        updateActiveTab((tab) => ({
            ...tab,
            blocks: reflowBlocks(arrayMove(tab.blocks, oldIndex, newIndex)),
        }));
    };

    const handleDragStart = (_event: DragStartEvent) => {
        setIsDraggingBlock(true);
    };

    const handleSave = async () => {
        if (!draft || !user) {
            return;
        }
        const response = await mutations.save.mutateAsync(draft);
        if (response.portfolio) {
            const key = portfolioLocalStorageKey(user.id, response.portfolio.slug);
            window.localStorage.setItem(key, JSON.stringify(toSaveRequest(response.portfolio)));
        }
    };

    const updateSlug = async (value: string) => {
        const slug = normalizePortfolioSlug(value);
        if (slug.length < 3) {
            setSlugMessage("Portfolio URL name must be at least 3 characters.");
            return;
        }

        const availability = await mutations.checkSlug.mutateAsync(slug);
        if (!availability.available) {
            setSlugMessage("That portfolio URL is already taken.");
            return;
        }

        setSlugMessage("");
        updateDraft((current) => ({ ...current, slug }));
        setSlugInput(slug);
    };

    if (currentPortfolio.isPending) {
        return (
            <div className="grid min-h-[60vh] place-items-center text-[var(--gb-muted)]">
                <Loader2 className="mb-3 size-5 animate-spin" />
                Loading portfolio workspace...
            </div>
        );
    }

    if (step === "slug") {
        const normalizedSlug = normalizePortfolioSlug(slugInput);
        return (
            <div className="mx-auto max-w-3xl space-y-5">
                <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                    <CardHeader className="px-6 pt-6">
                        <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-[#16A34A]/10 text-[#16A34A]">
                            <Sparkles className="size-5" />
                        </div>
                        <CardTitle className="font-['Bricolage_Grotesque'] text-3xl tracking-[-0.04em]">
                            Claim your portfolio URL
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 px-6 pb-6">
                        <div className="space-y-2">
                            <Label htmlFor="portfolio-slug">Portfolio name</Label>
                            <Input
                                id="portfolio-slug"
                                value={slugInput}
                                onChange={(event) => setSlugInput(event.target.value)}
                                placeholder="your-name"
                                className="h-11 border-[var(--gb-border)] bg-[var(--gb-bg)]"
                            />
                            <p className="text-xs text-[var(--gb-muted)]">
                                Letters, numbers, and hyphens only. You can change it later, but the link will
                                change.
                            </p>
                        </div>
                        <div className="grid gap-3 rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-bg)] p-4 text-sm">
                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-[var(--gb-muted)]">
                                    Your public link
                                </p>
                                <p className="mt-1 font-medium text-[var(--gb-text)]">
                                    {publicUrlFor(normalizedSlug || "name", Boolean(user?.isPremium))}
                                </p>
                            </div>
                            {!user?.isPremium ? (
                                <div className="rounded-xl border border-[#16A34A]/20 bg-[#16A34A]/10 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#16A34A]">
                                        Pro URL preview
                                    </p>
                                    <p className="mt-1 text-[var(--gb-text)]">{premiumUrlFor(normalizedSlug)}</p>
                                    <p className="mt-1 text-xs text-[var(--gb-muted)]">
                                        Upgrade to Pro for a professional portfolio URL.
                                    </p>
                                </div>
                            ) : null}
                        </div>
                        {slugMessage ? <p className="text-sm text-destructive">{slugMessage}</p> : null}
                        <Button
                            className="gb-btn-primary h-10"
                            onClick={handleSlugContinue}
                            disabled={mutations.checkSlug.isPending || normalizedSlug.length < 3}
                        >
                            {mutations.checkSlug.isPending ? <Loader2 className="animate-spin" /> : <Check />}
                            Continue to templates
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === "template") {
        return (
            <div className="space-y-5">
                <div>
                    <p className="gb-sec-label">Portfolio templates</p>
                    <h1 className="font-['Bricolage_Grotesque'] text-3xl font-semibold tracking-[-0.04em]">
                        Pick a starting point
                    </h1>
                    <p className="mt-2 text-sm text-[var(--gb-muted)]">
                        Templates define layout rules, component styling, and the grid your blocks snap to.
                    </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                    {portfolioTemplates.map((template) => (
                        <button
                            key={template.id}
                            type="button"
                            onClick={() => chooseTemplate(template.id)}
                            className={cn(
                                "overflow-hidden rounded-3xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] p-3 text-left transition hover:-translate-y-1 hover:border-[#16A34A]/50",
                            )}
                        >
                            <div className={cn("relative h-48 overflow-hidden rounded-2xl p-5", template.previewClassName)}>
                                <div className={cn("absolute inset-0 opacity-35", template.backgroundArtClassName)} />
                                <div
                                    className={cn(
                                        "relative h-full border p-4",
                                        template.surfaceClassName,
                                        template.layout === "editorial" && "rounded-2xl",
                                        template.layout === "signal" && "rounded-lg font-mono",
                                        template.layout === "bloom" && "rounded-[2rem] text-center",
                                        template.layout === "mono" && "rounded-none border-2",
                                    )}
                                >
                                    <p className={cn("text-xs uppercase tracking-[0.3em]", template.accentClassName)}>
                                        {template.tone}
                                    </p>
                                    <p
                                        className={cn(
                                            "text-3xl font-semibold tracking-[-0.06em]",
                                            template.layout === "bloom" ? "mt-10" : "mt-8",
                                            template.layout === "mono" && "uppercase leading-none",
                                        )}
                                    >
                                        {template.name}
                                    </p>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="font-medium text-[var(--gb-text)]">{template.name}</p>
                                <p className="mt-1 text-sm leading-6 text-[var(--gb-muted)]">
                                    {template.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (!draft || !activeTab) {
        return null;
    }

    return (
        <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-4">
            <div className="sticky top-0 z-20 -mx-4 border-b border-[var(--gb-border)] bg-[var(--gb-bg)]/90 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-[var(--gb-muted)]">Live URL</p>
                        <p className="font-medium text-[var(--gb-text)]">
                            {publicUrlFor(draft.slug, Boolean(user?.isPremium))}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-[var(--gb-muted)]">
                            Local autosave {localSavedAt ? `at ${localSavedAt}` : "ready"}
                        </span>
                        <Button variant="outline" asChild>
                            <a href={`/user/${draft.slug}`} target="_blank" rel="noreferrer">
                                Preview
                            </a>
                        </Button>
                        <Button onClick={handleSave} disabled={mutations.save.isPending}>
                            {mutations.save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                            Save live
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid flex-1 items-start gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_20rem]">
                <aside className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-4 overflow-y-auto pr-1">
                    <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                        <CardHeader className="px-4 pt-4">
                            <CardTitle className="text-sm">Identity and URL</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 px-4 pb-4">
                            <InspectorField label="Display name">
                                <Input
                                    value={draft.identity.displayName}
                                    onChange={(event) =>
                                        updateDraft((current) => ({
                                            ...current,
                                            identity: {
                                                ...current.identity,
                                                displayName: event.target.value,
                                            },
                                        }))
                                    }
                                    placeholder="Your public name"
                                />
                            </InspectorField>
                            <InspectorField label="Small custom text">
                                <Input
                                    value={draft.identity.eyebrowText}
                                    onChange={(event) =>
                                        updateDraft((current) => ({
                                            ...current,
                                            identity: {
                                                ...current.identity,
                                                eyebrowText: event.target.value,
                                            },
                                        }))
                                    }
                                    placeholder="Available for product roles"
                                />
                            </InspectorField>
                            <InspectorField label="Text placement">
                                <Select
                                    value={draft.identity.eyebrowPlacement}
                                    onValueChange={(value) =>
                                        updateDraft((current) => ({
                                            ...current,
                                            identity: {
                                                ...current.identity,
                                                eyebrowPlacement: value === "below" ? "below" : "above",
                                            },
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="above">Above name</SelectItem>
                                        <SelectItem value="below">Below name</SelectItem>
                                    </SelectContent>
                                </Select>
                            </InspectorField>
                            <InspectorField label="URL slug">
                                <Input
                                    value={slugInput || draft.slug}
                                    onChange={(event) => setSlugInput(event.target.value)}
                                    onBlur={() => void updateSlug(slugInput || draft.slug)}
                                    placeholder="your-name"
                                />
                            </InspectorField>
                            {slugMessage ? <p className="text-xs text-destructive">{slugMessage}</p> : null}
                            <p className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg)] px-3 py-2 text-xs leading-5 text-[var(--gb-muted)]">
                                Display name changes the visual portfolio title. Slug only changes the public URL.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                        <CardHeader className="px-4 pt-4">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Sparkles className="size-4 text-[#16A34A]" />
                                Templates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 px-4 pb-4">
                            {portfolioTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => applyTemplate(template.id)}
                                    className={cn(
                                        "w-full overflow-hidden rounded-xl border p-2 text-left transition",
                                        draft.templateId === template.id
                                            ? "border-[#16A34A]/50 bg-[#16A34A]/10"
                                            : "border-[var(--gb-border)] hover:border-[#16A34A]/30",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "relative block overflow-hidden rounded-lg px-3 py-2 text-xs font-semibold",
                                            template.previewClassName,
                                            template.layout === "mono" && "rounded-none border border-current/30 uppercase",
                                        )}
                                    >
                                        <span className={cn("absolute inset-0 opacity-30", template.backgroundArtClassName)} />
                                        <span className="relative">
                                        {template.name}
                                        </span>
                                    </span>
                                    <span className="mt-2 block px-1 text-[0.7rem] leading-4 text-[var(--gb-muted)]">
                                        {template.tone}
                                    </span>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                        <CardHeader className="px-4 pt-4">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <LayoutTemplate className="size-4 text-[#16A34A]" />
                                Tabs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 px-4 pb-4">
                            {draft.tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTabId(tab.id);
                                        setSelectedBlockId(tab.blocks[0]?.id ?? null);
                                    }}
                                    className={cn(
                                        "w-full rounded-xl border px-3 py-2 text-left text-sm",
                                        activeTab.id === tab.id
                                            ? "border-[#16A34A]/40 bg-[#16A34A]/10"
                                            : "border-[var(--gb-border)]",
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                            <Button variant="outline" className="w-full" onClick={addTab}>
                                <Plus />
                                Add tab
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                        <CardHeader className="px-4 pt-4">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Plus className="size-4 text-[#0284C7]" />
                                Blocks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 px-4 pb-4">
                            {blockLibrary.map((block) => (
                                <button
                                    key={block.type}
                                    type="button"
                                    onClick={() => addBlock(block.type)}
                                    className="w-full rounded-xl border border-[var(--gb-border)] p-3 text-left transition hover:border-[#0284C7]/40 hover:bg-[#0284C7]/10"
                                >
                                    <span className="block text-sm font-medium text-[var(--gb-text)]">
                                        {block.label}
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-[var(--gb-muted)]">
                                        {block.description}
                                    </span>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </aside>

                <section className="sticky top-24 h-[calc(100vh-7rem)] overflow-hidden rounded-[2rem] border border-[var(--gb-border)] bg-black shadow-2xl">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragCancel={() => setIsDraggingBlock(false)}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={activeTab.blocks.map((block) => block.id)} strategy={rectSortingStrategy}>
                            <PortfolioRenderer
                                portfolio={draft}
                                activeTabId={activeTab.id}
                                selectedBlockId={selectedBlockId}
                                onTabChange={setActiveTabId}
                                onBlockSelect={setSelectedBlockId}
                                chrome="builder"
                                showGrid={isDraggingBlock}
                                renderBlockWrapper={(block, content, className, style) => (
                                    <SortableBlockShell
                                        key={block.id}
                                        block={block}
                                        className={className}
                                        style={style}
                                        onSelect={setSelectedBlockId}
                                    >
                                        {content}
                                    </SortableBlockShell>
                                )}
                            />
                        </SortableContext>
                    </DndContext>
                </section>

                <aside className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-4 overflow-y-auto pr-1">
                    <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                        <CardHeader className="px-4 pt-4">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Palette className="size-4 text-[#16A34A]" />
                                Template style
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 px-4 pb-4">
                            <InspectorField label="Accent">
                                <ColorPicker
                                    value={draft.style.accentColor}
                                    onChange={(accentColor) =>
                                        updateDraft((current) => ({
                                            ...current,
                                            style: { ...current.style, accentColor },
                                        }))
                                    }
                                />
                            </InspectorField>
                            <div className="space-y-2">
                                <Label>Radius</Label>
                                <Select
                                    value={draft.style.radius}
                                    onValueChange={(value) =>
                                        updateDraft((current) => ({
                                            ...current,
                                            style: {
                                                ...current.style,
                                                radius: value as SavePortfolioRequest["style"]["radius"],
                                            },
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sharp">Sharp</SelectItem>
                                        <SelectItem value="soft">Soft</SelectItem>
                                        <SelectItem value="round">Round</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                        <CardHeader className="px-4 pt-4">
                            <div className="flex items-center justify-between gap-2">
                                <CardTitle className="text-sm">Selected block</CardTitle>
                                {selectedBlock ? (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon-sm"
                                        onClick={deleteSelectedBlock}
                                        aria-label="Delete selected block"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 px-4 pb-4">
                            {selectedBlock ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={selectedBlock.title ?? ""}
                                            onChange={(event) =>
                                                updateSelectedBlock((block) => ({
                                                    ...block,
                                                    title: event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Rows2 className="size-4" />
                                            Block width
                                        </Label>
                                        <Select
                                            value={String(selectedBlock.grid.columnSpan === 2 ? 2 : 1)}
                                            onValueChange={(value) =>
                                                updateSelectedBlock((block) => ({
                                                    ...block,
                                                    grid: {
                                                        ...block.grid,
                                                        column: 1,
                                                        columnSpan: value === "2" ? 2 : 1,
                                                        rowSpan: 1,
                                                    },
                                                }))
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Half width</SelectItem>
                                                <SelectItem value="2">Full width</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-[var(--gb-muted)]">
                                            Blocks snap to a two-column grid. Drag to reorder; use width for layout.
                                        </p>
                                    </div>
                                    <BlockDataFields
                                        block={selectedBlock}
                                        onChange={(data) =>
                                            updateSelectedBlock((block) => ({
                                                ...block,
                                                data,
                                            }))
                                        }
                                    />
                                </>
                            ) : (
                                <p className="text-sm text-[var(--gb-muted)]">
                                    Select a block in the preview to edit layout and content.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
