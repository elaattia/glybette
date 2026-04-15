/**
 * Parse a Bearer token from an Authorization header value.
 * @returns The raw token, or null if missing / not Bearer.
 */
export function parseBearerToken(authorization: string | undefined): string | null {
    if (!authorization) return null;
    const prefix = "Bearer ";
    if (!authorization.startsWith(prefix)) return null;
    const token = authorization.slice(prefix.length).trim();
    return token.length > 0 ? token : null;
}
