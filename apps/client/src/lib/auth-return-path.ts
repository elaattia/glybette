type AppHomeUser = {
    baseRole?: "student" | "enterprise";
};

const BLOCKED_PREFIXES = ["/login", "/verify-email", "/auth/"];

export function getSafeReturnPath(from: unknown): string | null {
    if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//")) {
        return null;
    }

    if (!from.startsWith("/app") && from !== "/dashboard") {
        return null;
    }

    if (BLOCKED_PREFIXES.some((prefix) => from === prefix || from.startsWith(prefix))) {
        return null;
    }

    return from;
}

export function getDefaultAppHomePath(user?: AppHomeUser): string {
    if (user?.baseRole === "enterprise") {
        return "/app/enterprise";
    }
    return "/app/dashboard";
}

export function resolveAuthenticatedDestination(
    from: unknown,
    user?: AppHomeUser,
): string {
    return getSafeReturnPath(from) ?? getDefaultAppHomePath(user);
}
