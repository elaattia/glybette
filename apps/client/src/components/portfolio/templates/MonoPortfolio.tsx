import { PortfolioFooter, PortfolioName, PortfolioTabNav } from "@/components/portfolio/shared/PortfolioHeaderPrimitives";
import { PortfolioGrid } from "@/components/portfolio/shared/PortfolioGrid";
import type { TemplateViewProps } from "@/components/portfolio/renderer-types";

export function MonoPortfolio({
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
        <main className="relative mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 py-8 md:px-10 md:py-12">
            <header className={`${radiusClassName} mb-8 grid gap-3 border-y-4 border-current py-5 pb-6 md:grid-cols-[18rem_minmax(0,1fr)]`}>
                <div className="md:col-start-2">
                    <PortfolioName identity={identity} titleClassName="text-6xl uppercase leading-none md:text-8xl" />
                </div>
                <PortfolioTabNav
                    tabs={portfolio.tabs}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    className="md:row-start-1 md:flex-col"
                    buttonClassName="rounded-none border-current/60 font-semibold uppercase"
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
                blockClassName="border-2 p-4 shadow-none"
            />
            <PortfolioFooter />
        </main>
    );
}
