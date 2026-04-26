import type { PortfolioBlock, SavePortfolioRequest } from "@glybette/contracts";
import { createPortfolioIdentity, normalizePortfolioSlug } from "@/lib/portfolio";

export function reflowBlocks(blocks: PortfolioBlock[]) {
    return blocks.map((block, index) => ({
        ...block,
        grid: {
            ...block.grid,
            column: 1,
            row: index + 1,
            columnSpan: block.grid.columnSpan === 2 ? 2 : 1,
            rowSpan: 1,
        },
    }));
}

export function normalizeDraftGrid(draft: SavePortfolioRequest): SavePortfolioRequest {
    const slug = normalizePortfolioSlug(draft.slug);
    return {
        ...draft,
        slug,
        identity: draft.identity ?? createPortfolioIdentity(slug),
        tabs: draft.tabs.map((tab) => ({
            ...tab,
            blocks: reflowBlocks(tab.blocks),
        })),
    };
}
