import { atom } from "jotai";
import type { BetterAuthSession } from "@/lib/auth-client";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export const authSessionUserAtom = atom<BetterAuthSession["user"] | null>(null);
export const authStatusAtom = atom<AuthStatus>("checking");
export const authBootstrappedAtom = atom(false);

export const authSessionAtom = atom((get) => ({
    user: get(authSessionUserAtom),
    status: get(authStatusAtom),
    bootstrapped: get(authBootstrappedAtom),
}));

export const setAuthenticatedSessionAtom = atom(null, (_get, set, payload: BetterAuthSession) => {
    set(authSessionUserAtom, payload.user);
    set(authStatusAtom, "authenticated");
    set(authBootstrappedAtom, true);
});

export const setUnauthenticatedSessionAtom = atom(null, (_get, set) => {
    set(authSessionUserAtom, null);
    set(authStatusAtom, "unauthenticated");
    set(authBootstrappedAtom, true);
});

export const setAuthCheckingAtom = atom(null, (_get, set) => {
    set(authStatusAtom, "checking");
});
