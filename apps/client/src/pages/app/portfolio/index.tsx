import { Loader2 } from "lucide-react";
import { PortfolioBuilderCanvas } from "@/pages/app/portfolio/components/PortfolioBuilderCanvas";
import { PortfolioBuilderLeftPanel } from "@/pages/app/portfolio/components/PortfolioBuilderLeftPanel";
import { PortfolioBuilderRightPanel } from "@/pages/app/portfolio/components/PortfolioBuilderRightPanel";
import { PortfolioEditorTopbar } from "@/pages/app/portfolio/components/PortfolioEditorTopbar";
import { PortfolioSlugStep } from "@/pages/app/portfolio/components/PortfolioSlugStep";
import { PortfolioTemplateStep } from "@/pages/app/portfolio/components/PortfolioTemplateStep";
import { useLocale } from "@/hooks/useLocale";
import { usePortfolioBuilderState } from "@/hooks/usePortfolioBuilderState";

export default function PortfolioBuilderPage() {
    const { t } = useLocale("portfolio");
    const builder = usePortfolioBuilderState();

    if (builder.currentPortfolio.isPending) {
        return (
            <div className="grid min-h-[60vh] place-items-center text-[var(--gb-muted)]">
                <Loader2 className="mb-3 size-5 animate-spin" />
                {t("builder.loading")}
            </div>
        );
    }

    if (builder.step === "slug") {
        return (
            <PortfolioSlugStep
                slugInput={builder.slugInput}
                setSlugInput={builder.setSlugInput}
                slugMessage={builder.slugMessage}
                isPremium={Boolean(builder.user?.isPremium)}
                isCheckingSlug={builder.mutations.checkSlug.isPending}
                onContinue={builder.handleSlugContinue}
            />
        );
    }

    if (builder.step === "template") {
        return <PortfolioTemplateStep onChooseTemplate={builder.chooseTemplate} />;
    }

    if (!builder.draft || !builder.activeTab) {
        return null;
    }

    return (
        <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-4">
            <PortfolioEditorTopbar
                slug={builder.draft.slug}
                isPremium={Boolean(builder.user?.isPremium)}
                localSavedAt={builder.localSavedAt}
                isSaving={builder.mutations.save.isPending}
                onSave={builder.handleSave}
            />

            <div className="grid flex-1 items-start gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_20rem]">
                <PortfolioBuilderLeftPanel
                    draft={builder.draft}
                    activeTab={builder.activeTab}
                    slugInput={builder.slugInput}
                    setSlugInput={builder.setSlugInput}
                    slugMessage={builder.slugMessage}
                    updateDraft={builder.updateDraft}
                    updateSlug={builder.updateSlug}
                    applyTemplate={builder.applyTemplate}
                    selectTab={builder.selectTab}
                    addTab={builder.addTab}
                    updateTab={builder.updateTab}
                    deleteTab={builder.deleteTab}
                    addBlock={builder.addBlock}
                />

                <PortfolioBuilderCanvas
                    draft={builder.draft}
                    activeTab={builder.activeTab}
                    selectedBlockId={builder.selectedBlockId}
                    setSelectedBlockId={builder.setSelectedBlockId}
                    setActiveTabId={builder.setActiveTabId}
                    isDraggingBlock={builder.isDraggingBlock}
                    sensors={builder.sensors}
                    onDragStart={builder.handleDragStart}
                    onDragCancel={builder.handleDragCancel}
                    onDragEnd={builder.handleDragEnd}
                />

                <PortfolioBuilderRightPanel
                    draft={builder.draft}
                    selectedBlock={builder.selectedBlock}
                    updateDraft={builder.updateDraft}
                    updateSelectedBlock={builder.updateSelectedBlock}
                    deleteSelectedBlock={builder.deleteSelectedBlock}
                />
            </div>
        </div>
    );
}
