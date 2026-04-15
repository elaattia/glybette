import type { SelfResponse } from "@glybette/contracts";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { setUnauthenticatedSessionAtom } from "@/features/auth/auth.atoms";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const userQueryKeys = {
    me: ["user", "me"] as const,
};

async function getCurrentUser() {
    return apiRequest<SelfResponse>("/api/users/me");
}

export function useUser() {
    const auth = useAuth();
    const clearSession = useSetAtom(setUnauthenticatedSessionAtom);

    const query = useQuery({
        queryKey: userQueryKeys.me,
        queryFn: getCurrentUser,
        enabled: auth.isAuthenticated,
        staleTime: 60_000,
    });

    useEffect(() => {
        if (query.error instanceof ApiError && query.error.status === 401) {
            clearSession();
        }
    }, [clearSession, query.error]);

    return {
        ...query,
        user: query.data?.user,
    };
}
