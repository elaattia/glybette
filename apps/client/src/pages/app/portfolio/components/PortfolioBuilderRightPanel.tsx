import type { PortfolioBlock, SavePortfolioRequest } from "@glybette/contracts";
import { Palette, Rows2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale } from "@/hooks/useLocale";
import { BlockDataFields } from "@/pages/app/portfolio/components/BlockDataFields";
import { InspectorField } from "@/pages/app/portfolio/components/InspectorField";

type PortfolioBuilderRightPanelProps = {
    draft: SavePortfolioRequest;
    selectedBlock: PortfolioBlock | null;
    updateDraft: (updater: (draft: SavePortfolioRequest) => SavePortfolioRequest) => void;
    updateSelectedBlock: (updater: (block: PortfolioBlock) => PortfolioBlock) => void;
    deleteSelectedBlock: () => void;
};

export function PortfolioBuilderRightPanel({
    draft,
    selectedBlock,
    updateDraft,
    updateSelectedBlock,
    deleteSelectedBlock,
}: PortfolioBuilderRightPanelProps) {
    const { t } = useLocale("portfolio");

    return (
        <aside className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-4 overflow-y-auto pr-1">
            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                <CardHeader className="px-4 pt-4">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Palette className="size-4 text-[#16A34A]" />
                        {t("builder.rightPanel.templateStyle")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4">
                    <InspectorField label={t("builder.rightPanel.accent")}>
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
                        <Label>{t("builder.rightPanel.radius")}</Label>
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
                            }>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sharp">{t("builder.rightPanel.radiusSharp")}</SelectItem>
                                <SelectItem value="soft">{t("builder.rightPanel.radiusSoft")}</SelectItem>
                                <SelectItem value="round">{t("builder.rightPanel.radiusRound")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                <CardHeader className="px-4 pt-4">
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-sm">{t("builder.rightPanel.selectedBlock")}</CardTitle>
                        {selectedBlock ? (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon-sm"
                                onClick={deleteSelectedBlock}
                                aria-label={t("builder.rightPanel.deleteSelectedBlockAria")}>
                                <Trash2 className="size-3.5" />
                            </Button>
                        ) : null}
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4">
                    {selectedBlock ? (
                        <>
                            <div className="space-y-2">
                                <Label>{t("builder.rightPanel.title")}</Label>
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
                                    {t("builder.rightPanel.blockWidth")}
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
                                    }>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">{t("builder.rightPanel.halfWidth")}</SelectItem>
                                        <SelectItem value="2">{t("builder.rightPanel.fullWidth")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-[var(--gb-muted)]">{t("builder.rightPanel.blockWidthHint")}</p>
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
                        <p className="text-sm text-[var(--gb-muted)]">{t("builder.rightPanel.selectBlockHint")}</p>
                    )}
                </CardContent>
            </Card>
        </aside>
    );
}
