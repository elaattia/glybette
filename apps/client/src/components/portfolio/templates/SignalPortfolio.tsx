import {
    PortfolioFooter,
    PortfolioName,
    PortfolioTabNav,
} from "@/components/portfolio/shared/PortfolioHeaderPrimitives";
import { PortfolioGrid } from "@/components/portfolio/shared/PortfolioGrid";
import type { TemplateViewProps } from "@/components/portfolio/renderer-types";

export function SignalPortfolio({
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
            <header
                className={`${radiusClassName} mb-8 border border-current/15 bg-[color-mix(in_srgb,var(--portfolio-accent)_14%,black)] p-4 pb-6 shadow-2xl shadow-black/20`}>
                <div
                    className={`${radiusClassName} border border-[color:color-mix(in_srgb,var(--portfolio-accent)_22%,transparent)] p-4`}>
                    <PortfolioName
                        identity={identity}
                        titleClassName="font-mono text-4xl uppercase tracking-[-0.04em] md:text-6xl"
                    />
                </div>
                <PortfolioTabNav
                    tabs={portfolio.tabs}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    className="mt-4"
                    buttonClassName="rounded-md font-mono uppercase"
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
                blockClassName="font-mono shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--portfolio-accent)_14%,transparent)]"
            />
            <PortfolioFooter />
        </main>
    );
}
