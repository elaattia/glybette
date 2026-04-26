import type { CSSProperties } from "react";
import type { PortfolioBlockType, PortfolioTab, PortfolioTemplateId, SavePortfolioRequest } from "@glybette/contracts";
import { LayoutTemplate, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { portfolioTemplates } from "@/components/portfolio/template-config";
import { blockLibrary } from "@/lib/portfolio";
import { cn } from "@/lib/utils";
import { InspectorField } from "@/pages/app/portfolio/components/InspectorField";

type PortfolioBuilderLeftPanelProps = {
    draft: SavePortfolioRequest;
    activeTab: PortfolioTab;
    slugInput: string;
    setSlugInput: (value: string) => void;
    slugMessage: string;
    updateDraft: (updater: (draft: SavePortfolioRequest) => SavePortfolioRequest) => void;
    updateSlug: (value: string) => void;
    applyTemplate: (templateId: PortfolioTemplateId) => void;
    selectTab: (tab: PortfolioTab) => void;
    addTab: () => void;
    updateTab: (tabId: string, label: string) => void;
    deleteTab: (tabId: string) => void;
    addBlock: (type: PortfolioBlockType) => void;
};

export function PortfolioBuilderLeftPanel({
    draft,
    activeTab,
    slugInput,
    setSlugInput,
    slugMessage,
    updateDraft,
    updateSlug,
    applyTemplate,
    selectTab,
    addTab,
    updateTab,
    deleteTab,
    addBlock,
}: PortfolioBuilderLeftPanelProps) {
    return (
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
                            }>
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
                            onBlur={() => updateSlug(slugInput || draft.slug)}
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
                            )}>
                            <span
                                className={cn(
                                    "relative block overflow-hidden rounded-lg px-3 py-2 text-xs font-semibold",
                                    template.previewClassName,
                                    template.sidebarPreviewClassName,
                                )}
                                style={{ "--portfolio-accent": template.defaultStyle.accentColor } as CSSProperties}>
                                <span className={cn("absolute inset-0 opacity-30", template.backgroundArtClassName)} />
                                <span className="relative">{template.name}</span>
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
                        <div
                            key={tab.id}
                            className={cn(
                                "flex items-center gap-2 rounded-xl border p-2 transition",
                                activeTab.id === tab.id
                                    ? "border-[#16A34A]/40 bg-[#16A34A]/10"
                                    : "border-[var(--gb-border)]",
                            )}>
                            <Input
                                value={tab.label}
                                onFocus={() => selectTab(tab)}
                                onChange={(event) => updateTab(tab.id, event.target.value)}
                                className="h-8 flex-1 border-transparent bg-transparent px-1 text-sm shadow-none focus-visible:border-[var(--gb-border)] focus-visible:bg-[var(--gb-bg)]"
                                aria-label={`Rename ${tab.label} tab`}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => deleteTab(tab.id)}
                                disabled={draft.tabs.length <= 1}
                                aria-label={`Delete ${tab.label} tab`}>
                                <Trash2 className="size-3.5" />
                            </Button>
                        </div>
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
                            className="w-full rounded-xl border border-[var(--gb-border)] p-3 text-left transition hover:border-[#0284C7]/40 hover:bg-[#0284C7]/10">
                            <span className="block text-sm font-medium text-[var(--gb-text)]">{block.label}</span>
                            <span className="mt-1 block text-xs leading-5 text-[var(--gb-muted)]">
                                {block.description}
                            </span>
                        </button>
                    ))}
                </CardContent>
            </Card>
        </aside>
    );
}
