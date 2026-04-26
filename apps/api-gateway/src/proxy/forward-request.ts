import type { Context } from "hono";
import { sanitizeProxyHeaders, AUTH_HEADER_USER_ID, AUTH_HEADER_ROLES, ServiceUnavailableError } from "@glybette/utils";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type ForwardRequestOptions = {
    timeoutMs: number;

    injectGatewayAuth?: boolean;
    method?: HttpMethod;
};

function joinBaseAndPath(baseUrl: string, pathWithQuery: string): string {
    const base = baseUrl.replace(/\/$/, "");
    const path = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
    return `${base}${path}`;
}

export async function forwardToService(
    c: Context,
    baseUrl: string,
    pathWithQuery: string,
    options: ForwardRequestOptions,
): Promise<Response> {
    const url = joinBaseAndPath(baseUrl, pathWithQuery);
    const inject = options.injectGatewayAuth === true;
    const auth = inject ? c.get("gatewayAuth") : undefined;
    const injectHeaders = inject && !!auth;
    const headers = sanitizeProxyHeaders(c.req.raw.headers, {
        stripAuthorization: injectHeaders,
    });

    if (injectHeaders && auth) {
        headers.set(AUTH_HEADER_USER_ID, auth.userId);
        headers.set(AUTH_HEADER_ROLES, auth.roles.join(","));
        const secret = process.env.INTERNAL_SERVICE_SECRET ?? "dev-secret-ela";
        headers.set("x-internal-secret", secret);
    }

    const body = c.req.raw.body;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    const requestInit: RequestInit & { duplex?: "half" } = {
        method: options.method ?? c.req.method,
        headers,
        body,
        signal: controller.signal,
        redirect: "manual",
    };
    if (body) {
        requestInit.duplex = "half";
    }

    try {
        console.log(" Forwarding to:", url);
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
