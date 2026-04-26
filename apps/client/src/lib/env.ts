const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
const rawPortfolioRootDomain = import.meta.env.VITE_PORTFOLIO_ROOT_DOMAIN?.trim() ?? "glybette.com";

export const appName = "Glybette";
export const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, "");
export const portfolioRootDomain = rawPortfolioRootDomain.replace(/\/$/, "");

export function getApiUrl(path: string) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${apiBaseUrl}${normalizedPath}`;
}
