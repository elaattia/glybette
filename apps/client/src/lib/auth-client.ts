import { createAuthClient } from "better-auth/react";
import { apiBaseUrl } from "@/lib/env";

function resolveAuthBaseUrl() {
    if (apiBaseUrl) {
        return `${apiBaseUrl}/api/auth`;
    }

    if (typeof window !== "undefined") {
        return new URL("/api/auth", window.location.origin).toString();
    }

    return "http://localhost:5173/api/auth";
}

export const authClient = createAuthClient({
    baseURL: resolveAuthBaseUrl(),
});

export type BetterAuthSession = typeof authClient.$Infer.Session;
