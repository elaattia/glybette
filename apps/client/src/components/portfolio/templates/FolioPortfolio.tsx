import {
    PortfolioFooter,
    PortfolioName,
    PortfolioTabNav,
} from "@/components/portfolio/shared/PortfolioHeaderPrimitives";
import { PortfolioGrid } from "@/components/portfolio/shared/PortfolioGrid";
import type { TemplateViewProps } from "@/components/portfolio/renderer-types";

export function FolioPortfolio({
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
            <header className={`${radiusClassName} mx-auto mb-8 max-w-3xl border-current/10 pb-6 text-center`}>
                <div>
                    <PortfolioName identity={identity} titleClassName="text-6xl md:text-8xl" />
                </div>
                <PortfolioTabNav
                    tabs={portfolio.tabs}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    className="mt-6 justify-center"
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
                blockClassName="shadow-[0_24px_60px_color-mix(in_srgb,var(--portfolio-accent)_16%,transparent)]"
            />
            <PortfolioFooter />
        </main>
    );
}
