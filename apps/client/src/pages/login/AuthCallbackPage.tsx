import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AuthCallbackPage() {
    const navigate = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        if (auth.isChecking) {
            return;
        }

        if (auth.isAuthenticated) {
            navigate("/dashboard", { replace: true });
            return;
        }

        navigate("/login?error=callback_failed", { replace: true });
    }, [auth.isAuthenticated, auth.isChecking, navigate]);

    return (
        <main className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-lg rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-8 text-center">
                <p className="gb-sec-label mb-3">Auth callback</p>
                <h1 className="font-['Bricolage_Grotesque'] text-3xl font-bold text-[var(--gb-text)]">
                    Finalizing your session
                </h1>
                <p className="mt-3 text-sm text-[var(--gb-muted)]">
                    {auth.isChecking
                        ? "Waiting for session confirmation from Better Auth."
                        : "Session not found. Redirecting to the login page."}
                </p>
            </div>
        </main>
    );
}
