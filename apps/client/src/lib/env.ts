const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

export const appName = "Glybette";
export const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, "");

export function getApiUrl(path: string) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${apiBaseUrl}${normalizedPath}`;
}
