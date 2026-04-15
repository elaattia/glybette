import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuth() {
    const auth = useAuth();
    const location = useLocation();

    if (auth.isChecking) {
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

    return <Outlet />;
}
