import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthGateSpinner } from "@/components/auth/AuthGateSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";

export function RequireAuth() {
    const auth = useAuth();
    const verification = useEmailVerification();
    const location = useLocation();

    if (auth.isChecking || (auth.isAuthenticated && verification.isPending)) {
        return <AuthGateSpinner />;
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (verification.requiresEmailVerification) {
        return <Navigate to="/verify-email" replace />;
    }

    return <Outlet />;
}
