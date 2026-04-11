import { OnboardingPage } from "@/pages/onboarding";
import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import { AuthCallbackPage } from "@/pages/login/AuthCallbackPage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuthBootstrap } from "@/hooks/useAuth";
import AppShellLayout from "@/components/app-shell";
import DashboardPage from "@/pages/app/dashboard";
import AppSectionPlaceholder from "@/pages/app/AppSectionPlaceholder";

function App() {
    useAuthBootstrap();

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route element={<RequireAuth />}>
                <Route path="/app" element={<AppShellLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="cv-builder" element={<AppSectionPlaceholder sectionName="CV Builder" />} />
                    <Route path="portfolio" element={<AppSectionPlaceholder sectionName="Portfolio" />} />
                    <Route
                        path="opportunities"
                        element={<AppSectionPlaceholder sectionName="Opportunities" />}
                    />
                    <Route path="projects" element={<AppSectionPlaceholder sectionName="Projects" />} />
                    <Route path="settings" element={<AppSectionPlaceholder sectionName="Settings" />} />
                </Route>
                <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;