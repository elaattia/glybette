const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
const rawPortfolioRootDomain = import.meta.env.VITE_PORTFOLIO_ROOT_DOMAIN?.trim() ?? "glybette.com";

export const appName = "Glybette";
export const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, "");
export const portfolioRootDomain = rawPortfolioRootDomain.replace(/\/$/, "");

/** Same-origin `/api` or `{VITE_API_BASE_URL}/api` when the API is on another host. */
export const apiPrefix = apiBaseUrl ? `${apiBaseUrl}/api` : "/api";

/** Base path for jobs routes (`/api/jobs` or `{VITE_API_BASE_URL}/api/jobs`). */
export const jobsApiBase = `${apiPrefix}/jobs`;

export function getApiUrl(path: string) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${apiBaseUrl}${normalizedPath}`;
}

export function getJobsApiUrl(path: string) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${jobsApiBase}${normalizedPath}`;
}
