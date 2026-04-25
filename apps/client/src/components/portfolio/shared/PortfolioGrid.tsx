import type { CSSProperties } from "react";
import { memo } from "react";
import type { PortfolioTab } from "@glybette/contracts";
import { PortfolioBlockContent } from "@/components/portfolio/shared/PortfolioBlockContent";
import type { ProjectItem, RenderBlockWrapper } from "@/components/portfolio/renderer-types";
import { cn } from "@/lib/utils";

type PortfolioGridProps = {
    activeTab?: PortfolioTab;
    radiusClassName: string;
    surfaceClassName: string;
    selectedBlockId?: string | null;
    onBlockSelect?: (blockId: string) => void;
    renderBlockWrapper?: RenderBlockWrapper;
    showGrid: boolean;
    onProjectClick: (project: ProjectItem) => void;
    blockClassName?: string;
};

function blockStyle(): CSSProperties {
    return {};
}

export const PortfolioGrid = memo(function PortfolioGrid({
    activeTab,
    radiusClassName,
    surfaceClassName,
    selectedBlockId,
    onBlockSelect,
    renderBlockWrapper,
    showGrid,
    onProjectClick,
    blockClassName,
}: PortfolioGridProps) {
    return (
        <section
            className={cn(
                "relative grid grid-cols-1 gap-4 rounded-[var(--portfolio-radius)] transition md:grid-cols-2",
                showGrid &&
                    "outline outline-1 outline-white/20 [background-image:linear-gradient(90deg,transparent_calc(50%_-_1px),rgba(255,255,255,0.24)_calc(50%_-_1px),rgba(255,255,255,0.24)_calc(50%_+_1px),transparent_calc(50%_+_1px))]",
            )}
        >
            {(activeTab?.blocks ?? []).map((block) => {
                const className = cn(
                    "group/card relative col-span-1 min-w-0 overflow-hidden border p-5 shadow-2xl shadow-black/10 backdrop-blur",
                    block.grid.columnSpan === 2 && "md:col-span-2",
                    surfaceClassName,
                    "border-[color:color-mix(in_srgb,var(--portfolio-accent)_32%,transparent)] bg-[color-mix(in_srgb,var(--portfolio-accent)_10%,transparent)]",
                    blockClassName,
                    radiusClassName,
                    selectedBlockId === block.id && "outline outline-2 outline-[var(--portfolio-accent)]",
                    onBlockSelect && "cursor-pointer",
                );
                const style = blockStyle();
                const content = <PortfolioBlockContent block={block} onProjectClick={onProjectClick} />;

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
    );
});
