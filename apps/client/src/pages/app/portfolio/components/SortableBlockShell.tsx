import { memo, type CSSProperties, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PortfolioBlock } from "@glybette/contracts";
import { GripVertical } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";

type SortableBlockShellProps = {
    block: PortfolioBlock;
    children: ReactNode;
    className: string;
    style: CSSProperties;
    onSelect: (blockId: string) => void;
};

export const SortableBlockShell = memo(function SortableBlockShell({
    block,
    children,
    className,
    style,
    onSelect,
}: SortableBlockShellProps) {
    const { t } = useLocale("portfolio");
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
            onClick={() => onSelect(block.id)}>
            <button
                type="button"
                className="absolute right-3 top-3 z-10 grid size-8 touch-none cursor-grab place-items-center rounded-full border border-current/15 bg-black/25 text-current/70 opacity-0 backdrop-blur transition hover:text-current group-hover/card:opacity-100 active:cursor-grabbing"
                aria-label={t("builder.sortableBlock.dragAria")}
                {...attributes}
                {...listeners}>
                <GripVertical className="size-4" />
            </button>
            {children}
        </article>
    );
});
