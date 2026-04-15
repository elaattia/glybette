import type { Context } from "hono";
import {
    sanitizeProxyHeaders,
    AUTH_HEADER_USER_ID,
    AUTH_HEADER_ROLES,
    ServiceUnavailableError,
} from "@glybette/utils";

export type ForwardRequestOptions = {
    /** Upstream timeout (abort fetch when exceeded). */
    timeoutMs: number;
    /**
     * When true, strip client Authorization and inject internal auth headers from `gatewayAuth`.
     */
    injectGatewayAuth?: boolean;
};

function joinBaseAndPath(baseUrl: string, pathWithQuery: string): string {
    const base = baseUrl.replace(/\/$/, "");
    const path = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
    return `${base}${path}`;
}

/**
 * Forward the incoming request to an upstream service with sanitized headers and optional streaming body.
 */
export async function forwardToService(
    c: Context,
    baseUrl: string,
    pathWithQuery: string,
    options: ForwardRequestOptions,
): Promise<Response> {
    const url = joinBaseAndPath(baseUrl, pathWithQuery);
    const inject = options.injectGatewayAuth === true;
    const headers = sanitizeProxyHeaders(c.req.raw.headers, {
        stripAuthorization: inject,
    });

    if (inject) {
        const auth = c.get("gatewayAuth");
        if (auth) {
            headers.set(AUTH_HEADER_USER_ID, auth.userId);
            headers.set(AUTH_HEADER_ROLES, auth.roles.join(","));
        }
    }

    const body = c.req.raw.body;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    const requestInit: RequestInit & { duplex?: "half" } = {
        method: c.req.method,
        headers,
        body,
        signal: controller.signal,
        redirect: "manual",
    };
    if (body) {
        requestInit.duplex = "half";
    }

    try {
        const res = await fetch(url, requestInit);
        const outHeaders = new Headers(res.headers);
        return new Response(res.body, { status: res.status, headers: outHeaders });
    } catch (err) {
        console.error("Proxy request failed:", err);
        throw new ServiceUnavailableError("Upstream service unavailable");
    } finally {
        clearTimeout(timeout);
    }
}
