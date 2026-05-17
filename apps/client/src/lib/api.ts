import type { AuthErrorResponse } from "@glybette/contracts";
import { getApiUrl } from "@/lib/env";

export class ApiError extends Error {
    public readonly status: number;
    public readonly code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

type ApiRequestOptions = RequestInit & {
    authToken?: string | null;
};

function isJsonResponse(response: Response) {
    return response.headers.get("content-type")?.includes("application/json") ?? false;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.body && !(options.body instanceof FormData) && !headers.has("content-type")) {
        headers.set("content-type", "application/json");
    }

    if (options.authToken) {
        headers.set("Authorization", `Bearer ${options.authToken}`);
    }

    const response = await fetch(getApiUrl(path), {
        ...options,
        headers,
        credentials: "include",
    });

    let payload: unknown = null;

    if (response.status !== 204 && isJsonResponse(response)) {
        payload = await response.json();
    }

    if (!response.ok) {
        const errorPayload = payload as AuthErrorResponse | null;

        throw new ApiError(
            errorPayload?.error.message ?? `Request failed with status ${response.status}`,
            response.status,
            errorPayload?.error.code,
        );
    }

    return payload as T;
}
