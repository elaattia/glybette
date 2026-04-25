import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";

export function RequireAuth() {
    const auth = useAuth();
    const verification = useEmailVerification();
    const location = useLocation();

    if (auth.isChecking || (auth.isAuthenticated && verification.isPending)) {
        return (
            <main className="min-h-screen flex items-center justify-center px-6">
                <div className="w-full max-w-md rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-6 text-center">
                    <p className="text-sm text-[var(--gb-muted)]">Checking your session...</p>
                </div>
            </main>
        );
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (verification.requiresEmailVerification) {
        return <Navigate to="/verify-email" replace />;
    }

    return <Outlet />;
}
