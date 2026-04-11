import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
    authSessionAtom,
    setAuthenticatedSessionAtom,
    setAuthCheckingAtom,
    setUnauthenticatedSessionAtom,
} from "@/features/auth/auth.atoms";
import { authClient } from "@/lib/auth-client";

export function useAuthBootstrap() {
    const setChecking = useSetAtom(setAuthCheckingAtom);
    const setAuthenticated = useSetAtom(setAuthenticatedSessionAtom);
    const setUnauthenticated = useSetAtom(setUnauthenticatedSessionAtom);
    const sessionQuery = authClient.useSession();

    useEffect(() => {
        if (sessionQuery.isPending || sessionQuery.isRefetching) {
            setChecking();
        }
    }, [sessionQuery.isPending, sessionQuery.isRefetching, setChecking]);

    useEffect(() => {
        if (!sessionQuery.data?.session) {
            return;
        }

        setAuthenticated(sessionQuery.data);
    }, [sessionQuery.data, setAuthenticated]);

    useEffect(() => {
        if (sessionQuery.isPending || sessionQuery.isRefetching) {
            return;
        }

        if (!sessionQuery.data?.session) {
            setUnauthenticated();
        }
    }, [sessionQuery.data, sessionQuery.isPending, sessionQuery.isRefetching, setUnauthenticated]);

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
        isChecking: authSession.status === "checking" || sessionQuery.isPending || sessionQuery.isRefetching,
        startGoogleSignIn: async () => {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: `${window.location.origin}/auth/callback`,
            });
        },
        logout: logoutMutation.mutateAsync,
        logoutMutation,
    };
}
