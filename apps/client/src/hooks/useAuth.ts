import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
    authSessionAtom,
    setAuthenticatedSessionAtom,
    setAuthCheckingAtom,
    setUnauthenticatedSessionAtom,
} from "@/state/auth/auth.atoms";
import { authClient } from "@/lib/auth-client";
import { ApiError } from "@/lib/api";

type BetterAuthMaybeError = { error?: { message?: string } | null } | null | undefined;

function assertNoAuthError(result: BetterAuthMaybeError, fallbackMessage: string): void {
    const message = result?.error?.message;
    if (message) {
        throw new ApiError(message, 400, "AUTH_FAILED");
    }
    if (result && "error" in result && result.error) {
        throw new ApiError(fallbackMessage, 400, "AUTH_FAILED");
    }
}

export function useAuthBootstrap() {
    const setChecking = useSetAtom(setAuthCheckingAtom);
    const setAuthenticated = useSetAtom(setAuthenticatedSessionAtom);
    const setUnauthenticated = useSetAtom(setUnauthenticatedSessionAtom);
    const sessionQuery = authClient.useSession();

    useEffect(() => {
        if (sessionQuery.data !== undefined) {
            return;
        }
        if (sessionQuery.isPending || sessionQuery.isRefetching) {
            setChecking();
        }
    }, [sessionQuery.data, sessionQuery.isPending, sessionQuery.isRefetching, setChecking]);

    useEffect(() => {
        if (!sessionQuery.data?.session) {
            return;
        }

        setAuthenticated(sessionQuery.data);
    }, [sessionQuery.data, setAuthenticated]);

    useEffect(() => {
        if (sessionQuery.data === undefined) {
            return;
        }

        if (!sessionQuery.data?.session) {
            setUnauthenticated();
        }
    }, [sessionQuery.data, setUnauthenticated]);

    return sessionQuery;
}

export function useAuth() {
    const authSession = useAtomValue(authSessionAtom);
    const setUnauthenticated = useSetAtom(setUnauthenticatedSessionAtom);
    const queryClient = useQueryClient();
    const sessionQuery = authClient.useSession();

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await authClient.signOut();
        },
        onSettled: () => {
            setUnauthenticated();
            void sessionQuery.refetch();
            queryClient.removeQueries({ queryKey: ["user", "me"] });
        },
    });

    return {
        ...authSession,
        session: sessionQuery.data?.session ?? null,
        isAuthenticated: authSession.status === "authenticated" && Boolean(sessionQuery.data?.session),
        isChecking:
            authSession.status === "checking" ||
            (sessionQuery.data === undefined &&
                (sessionQuery.isPending || sessionQuery.isRefetching)),
        startGoogleSignIn: async () => {
            const result = (await authClient.signIn.social({
                provider: "google",
                callbackURL: `${window.location.origin}/auth/callback`,
            })) as BetterAuthMaybeError;
            assertNoAuthError(result, "Google sign-in failed");
        },
        startEmailPasswordSignIn: async (email: string, password: string) => {
            const result = (await authClient.signIn.email({
                email,
                password,
                callbackURL: `${window.location.origin}/auth/callback`,
            })) as BetterAuthMaybeError;
            assertNoAuthError(result, "Email sign-in failed");
        },
        logout: logoutMutation.mutateAsync,
        logoutMutation,
    };
}
