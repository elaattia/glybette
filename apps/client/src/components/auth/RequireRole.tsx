import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthGateSpinner } from "@/components/auth/AuthGateSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";

type RequireBaseRoleProps = {
    allowed: Array<"student" | "enterprise">;
    redirectTo?: string;
};

export function RequireBaseRole({ allowed, redirectTo = "/app" }: RequireBaseRoleProps) {
    const auth = useAuth();
    const location = useLocation();
    const { user, isPending } = useUser();

    if (auth.isChecking) {
        return <AuthGateSpinner />;
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (isPending) {
        return <AuthGateSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (!allowed.includes(user.baseRole)) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
}

export function RequireAdmin({ redirectTo = "/app" }: { redirectTo?: string }) {
    const auth = useAuth();
    const location = useLocation();
    const { user, isPending } = useUser();

    if (auth.isChecking) {
        return <AuthGateSpinner />;
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (isPending) {
        return <AuthGateSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (!user.isAdmin) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
}
