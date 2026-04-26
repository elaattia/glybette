import type { SavePortfolioRequest } from "@glybette/contracts";

const DRAFT_STORAGE_VERSION = "v2";

function legacyPortfolioLocalStorageKey(userId: string, slug: string) {
    return `glybette:portfolio:${userId}:${slug || "new"}`;
}

export function portfolioLocalStorageKey(userId: string, slug: string) {
    return `glybette:portfolio-draft:${DRAFT_STORAGE_VERSION}:${userId}:${slug || "new"}`;
}

export function loadPortfolioDraft(userId: string, slug: string) {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const value =
            window.localStorage.getItem(portfolioLocalStorageKey(userId, slug)) ??
            window.localStorage.getItem(legacyPortfolioLocalStorageKey(userId, slug));
        return value ? (JSON.parse(value) as SavePortfolioRequest) : null;
    } catch {
        return null;
    }
}

export function savePortfolioDraft(userId: string, draft: SavePortfolioRequest) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(portfolioLocalStorageKey(userId, draft.slug), JSON.stringify(draft));
    } catch {
        // Browsers can reject localStorage writes in private mode or after quota exhaustion.
    }
}
