import { OnboardingPage } from "@/pages/onboarding";
import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import ProtectedAppPage from "@/pages/app";
import { AuthCallbackPage } from "@/pages/login/AuthCallbackPage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuthBootstrap } from "@/hooks/useAuth";

function App() {
    useAuthBootstrap();

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route element={<RequireAuth />}>
                <Route path="/dashboard" element={<ProtectedAppPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;