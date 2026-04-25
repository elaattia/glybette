import HomePage from "@/pages/home";
import { portfolioRootDomain } from "@/lib/env";
import { normalizePortfolioSlug } from "@/lib/portfolio";
import { PublicPortfolioPage } from "./PublicPortfolioPage";

function resolveSubdomainSlug() {
    if (typeof window === "undefined") {
        return null;
    }

    const hostname = window.location.hostname.toLowerCase();
    const root = portfolioRootDomain.replace(/^\*\./, "").toLowerCase();
    if (
        hostname === root ||
        hostname === `www.${root}` ||
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        !hostname.endsWith(`.${root}`)
    ) {
        return null;
    }

    const candidate = hostname.slice(0, -root.length - 1);
    return candidate.includes(".") ? null : normalizePortfolioSlug(candidate);
}

export function PortfolioRoot() {
    const slug = resolveSubdomainSlug();
    if (!slug) {
        return <HomePage />;
    }

    return <PublicPortfolioPage slug={slug} resolveFromHost />;
}
