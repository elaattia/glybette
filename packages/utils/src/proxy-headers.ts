/**
 * Hop-by-hop and other headers that must not be blindly forwarded through a gateway.
 * @see https://www.rfc-editor.org/rfc/rfc9110.html#name-connection-specific-header-f
 */
const HOP_BY_HOP_HEADER_NAMES = new Set(
    [
        "connection",
        "keep-alive",
        "proxy-authenticate",
        "proxy-authorization",
        "te",
        "trailer",
        "transfer-encoding",
        "upgrade",
    ].map((h) => h.toLowerCase()),
);

export interface SanitizeProxyHeadersOptions {
    /** Strip Authorization before forwarding (e.g. when using internal auth headers). */
    stripAuthorization?: boolean;
}

/**
 * Build a new Headers instance safe to send to an upstream service.
 */
export function sanitizeProxyHeaders(
    source: Headers,
    options: SanitizeProxyHeadersOptions = {},
): Headers {
    const out = new Headers();
    for (const [key, value] of source) {
        const lower = key.toLowerCase();
        if (HOP_BY_HOP_HEADER_NAMES.has(lower)) continue;
        if (lower === "host") continue;
        out.append(key, value);
    }
    if (options.stripAuthorization) {
        out.delete("Authorization");
        out.delete("authorization");
    }
    return out;
}
