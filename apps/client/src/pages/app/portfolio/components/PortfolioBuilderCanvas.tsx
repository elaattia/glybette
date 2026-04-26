import { useCallback, type CSSProperties, type ReactNode } from "react";
import { closestCenter, DndContext, type DragEndEvent, type DragStartEvent, type SensorDescriptor, type SensorOptions } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import type { PortfolioBlock, PortfolioTab, SavePortfolioRequest } from "@glybette/contracts";
import { PortfolioRenderer } from "@/components/portfolio/PortfolioRenderer";
import { SortableBlockShell } from "@/pages/app/portfolio/components/SortableBlockShell";

type PortfolioBuilderCanvasProps = {
    draft: SavePortfolioRequest;
    activeTab: PortfolioTab;
    selectedBlockId: string | null;
    setSelectedBlockId: (blockId: string | null) => void;
    setActiveTabId: (tabId: string) => void;
    isDraggingBlock: boolean;
    sensors: SensorDescriptor<SensorOptions>[];
    onDragStart: (event: DragStartEvent) => void;
    onDragCancel: () => void;
    onDragEnd: (event: DragEndEvent) => void;
};

export function PortfolioBuilderCanvas({
    draft,
    activeTab,
    selectedBlockId,
    setSelectedBlockId,
    setActiveTabId,
    isDraggingBlock,
    sensors,
    onDragStart,
    onDragCancel,
    onDragEnd,
}: PortfolioBuilderCanvasProps) {
    const renderBlockWrapper = useCallback(
        (block: PortfolioBlock, content: ReactNode, className: string, style: CSSProperties) => (
            <SortableBlockShell
                key={block.id}
                block={block}
                className={className}
                style={style}
                onSelect={setSelectedBlockId}
            >
                {content}
            </SortableBlockShell>
        ),
        [setSelectedBlockId],
    );

    return (
        <section className="sticky top-24 h-[calc(100vh-7rem)] overflow-hidden rounded-[2rem] border border-[var(--gb-border)] bg-black shadow-2xl">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragCancel={onDragCancel}
                onDragEnd={onDragEnd}
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
                        renderBlockWrapper={renderBlockWrapper}
                    />
                </SortableContext>
            </DndContext>
        </section>
    );
}
