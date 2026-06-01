import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/hooks/useUser";

type RequireBaseRoleProps = {
    allowed: Array<"student" | "enterprise">;
    redirectTo?: string;
};

export function RequireBaseRole({ allowed, redirectTo = "/app" }: RequireBaseRoleProps) {
    const { user, isPending } = useUser();
    if (isPending) {
        return (
            <main className="min-h-screen flex items-center justify-center px-6">
                <div className="w-full max-w-md rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-6 text-center">
                    <p className="text-sm text-[var(--gb-muted)]">Loading your role permissions...</p>
                </div>
            </main>
        );
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (!allowed.includes(user.baseRole)) {
        return <Navigate to={redirectTo} replace />;
    }
    return <Outlet />;
}

export function RequireAdmin({ redirectTo = "/app" }: { redirectTo?: string }) {
    const { user, isPending } = useUser();
    if (isPending) {
        return (
            <main className="min-h-screen flex items-center justify-center px-6">
                <div className="w-full max-w-md rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-6 text-center">
                    <p className="text-sm text-[var(--gb-muted)]">Loading your admin access...</p>
                </div>
            </main>
        );
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (!user.isAdmin) {
        return <Navigate to={redirectTo} replace />;
    }
    return <Outlet />;
}
