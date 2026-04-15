/**
 * Resolve JWT signing/verification secret with the same fallback chain as services.
 */
export function resolveJwtSecret(options: {
    jwtSecret?: string | undefined;
    betterAuthSecret?: string | undefined;
}): string | undefined {
    return options.jwtSecret ?? options.betterAuthSecret;
}
