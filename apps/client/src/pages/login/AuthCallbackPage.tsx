import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { useUser } from "@/hooks/useUser";
import { resolveAuthenticatedDestination } from "@/lib/auth-return-path";

export function AuthCallbackPage() {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    const verification = useEmailVerification();
    const { user } = useUser();

    useEffect(() => {
        if (auth.isChecking || (auth.isAuthenticated && verification.isPending)) {
            return;
        }

        if (auth.isAuthenticated) {
            if (verification.requiresEmailVerification) {
                navigate("/verify-email", { replace: true });
                return;
            }
            const from = (location.state as { from?: string } | null)?.from;
            navigate(resolveAuthenticatedDestination(from, user), { replace: true });
            return;
        }

        navigate("/login?error=callback_failed", { replace: true });
    }, [
        auth.isAuthenticated,
        auth.isChecking,
        location.state,
        navigate,
        user,
        verification.isPending,
        verification.requiresEmailVerification,
    ]);

    const statusMessage = auth.isChecking
        ? t("callback.checking")
        : verification.isPending
          ? t("callback.pending")
          : t("callback.notFound");

    return (
        <main className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-lg rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-8 text-center">
                <p className="gb-sec-label mb-3">{t("callback.label")}</p>
                <h1 className="font-['Bricolage_Grotesque'] text-3xl font-bold text-[var(--gb-text)]">
                    {t("callback.title")}
                </h1>
                <p className="mt-3 text-sm text-[var(--gb-muted)]">{statusMessage}</p>
            </div>
        </main>
    );
}
