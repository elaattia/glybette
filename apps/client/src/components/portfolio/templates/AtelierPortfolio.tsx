import { PortfolioFooter, PortfolioName, PortfolioTabNav } from "@/components/portfolio/shared/PortfolioHeaderPrimitives";
import { PortfolioGrid } from "@/components/portfolio/shared/PortfolioGrid";
import type { TemplateViewProps } from "@/components/portfolio/renderer-types";

export function AtelierPortfolio({
    portfolio,
    template,
    identity,
    activeTab,
    selectedBlockId,
    onTabChange,
    onBlockSelect,
    renderBlockWrapper,
    showGrid,
    radiusClassName,
    onProjectClick,
}: TemplateViewProps) {
    return (
        <main className="relative mx-auto flex min-h-full w-full max-w-6xl flex-col px-5 py-8 md:px-10 md:py-12">
            <header className="mb-8 grid gap-6 border-b border-current/10 pb-6 md:grid-cols-1">
                <div>
                    <PortfolioName identity={identity} />
                </div>
                <PortfolioTabNav
                    tabs={portfolio.tabs}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    className="mt-2 max-w-full justify-start border-t border-current/10 pt-4"
                />
            </header>
            <PortfolioGrid
                activeTab={activeTab}
                radiusClassName={radiusClassName}
                surfaceClassName={template.surfaceClassName}
                selectedBlockId={selectedBlockId}
                onBlockSelect={onBlockSelect}
                renderBlockWrapper={renderBlockWrapper}
                showGrid={showGrid}
                onProjectClick={onProjectClick}
            />
            <PortfolioFooter />
        </main>
    );
}
