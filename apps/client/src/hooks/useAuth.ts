import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
    authSessionAtom,
    setAuthenticatedSessionAtom,
    setUnauthenticatedSessionAtom,
} from "@/state/auth/auth.atoms";
import { authClient } from "@/lib/auth-client";
import { ApiError } from "@/lib/api";

type BetterAuthMaybeError = { error?: { message?: string } | null } | null | undefined;
type BetterAuthApiClient = {
    changePassword: (payload: {
        currentPassword: string;
        newPassword: string;
        revokeOtherSessions?: boolean;
    }) => Promise<BetterAuthMaybeError>;
    setPassword?: (payload: {
        newPassword: string;
        revokeOtherSessions?: boolean;
    }) => Promise<BetterAuthMaybeError>;
    deleteUser: (payload?: { password?: string }) => Promise<BetterAuthMaybeError>;
};

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
    const setAuthenticated = useSetAtom(setAuthenticatedSessionAtom);
    const setUnauthenticated = useSetAtom(setUnauthenticatedSessionAtom);
    const sessionQuery = authClient.useSession();

    useEffect(() => {
        if (sessionQuery.isPending) {
            return;
        }

        if (sessionQuery.data?.session) {
            setAuthenticated(sessionQuery.data);
        } else {
            setUnauthenticated();
        }
    }, [
        sessionQuery.data,
        sessionQuery.isPending,
        setAuthenticated,
        setUnauthenticated,
    ]);

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

    const isChecking = !authSession.bootstrapped || authSession.status === "checking";
    const isAuthenticated = authSession.bootstrapped && authSession.status === "authenticated";
    const authApi = authClient as unknown as BetterAuthApiClient;

    return {
        ...authSession,
        session: sessionQuery.data?.session ?? null,
        isAuthenticated,
        isChecking,
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
        changePassword: async (payload: { newPassword: string; currentPassword?: string }) => {
            if (payload.currentPassword) {
                const result = await authApi.changePassword({
                    currentPassword: payload.currentPassword,
                    newPassword: payload.newPassword,
                    revokeOtherSessions: true,
                });
                assertNoAuthError(result, "Password change failed");
                return;
            }

            if (typeof authApi.setPassword !== "function") {
                throw new ApiError("Password setup is unavailable for this account.", 400, "PASSWORD_SETUP_UNAVAILABLE");
            }

            const result = await authApi.setPassword({
                newPassword: payload.newPassword,
                revokeOtherSessions: true,
            });
            assertNoAuthError(result, "Password setup failed");
        },
        deleteAccount: async (password?: string) => {
            const result = await authApi.deleteUser(password ? { password } : undefined);
            assertNoAuthError(result, "Account deletion failed");
            setUnauthenticated();
            queryClient.removeQueries({ queryKey: ["user", "me"] });
            queryClient.removeQueries({ queryKey: ["auth", "verification-status"] });
            queryClient.removeQueries({ queryKey: ["user", "profile"] });
        },
        logout: logoutMutation.mutateAsync,
        logoutMutation,
    };
}
