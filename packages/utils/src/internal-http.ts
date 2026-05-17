import { ServiceUnavailableError } from "./errors.js";

export class InternalHttpError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly responseText: string,
    ) {
        super(message);
        this.name = "InternalHttpError";
    }
}

export interface InternalRequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    timeoutMs?: number;
    headers?: HeadersInit;
    body?: string;
    internalSecret?: string;
    correlationId?: string;
}

export async function internalRequestJson<T>(url: string, options: InternalRequestOptions = {}): Promise<T> {
    const timeoutMs = options.timeoutMs ?? 10_000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const headers = new Headers(options.headers);
    headers.set("accept", "application/json");
    if (options.body && !headers.has("content-type")) {
        headers.set("content-type", "application/json");
    }
    if (options.internalSecret) {
        headers.set("x-internal-secret", options.internalSecret);
    }
    if (options.correlationId) {
        headers.set("x-correlation-id", options.correlationId);
    }

    try {
        const response = await fetch(url, {
            method: options.method ?? "GET",
            headers,
            body: options.body,
            signal: controller.signal,
        });
        if (!response.ok) {
            const responseText = await response.text().catch(() => "");
            throw new InternalHttpError(
                `Internal request failed with status ${response.status}`,
                response.status,
                responseText,
            );
        }

        if (response.status === 204) {
            return null as T;
        }

        return (await response.json()) as T;
    } catch (error) {
        if (error instanceof InternalHttpError) {
            throw error;
        }
        throw new ServiceUnavailableError("Internal upstream unavailable");
    } finally {
        clearTimeout(timeout);
    }
}
