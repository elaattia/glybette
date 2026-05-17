import { OnboardingPage } from "@/pages/onboarding";
import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "@/pages/login";
import { AuthCallbackPage } from "@/pages/login/AuthCallbackPage";
import { VerifyEmailPage } from "@/pages/login/VerifyEmailPage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuthBootstrap } from "@/hooks/useAuth";
import AppShellLayout from "@/components/app-shell";
import DashboardPage from "@/pages/app/dashboard";
import AppSectionPlaceholder from "@/pages/app/AppSectionPlaceholder";
import CvListPage from "@/pages/app/cv-builder";
import CvCreatePage from "@/pages/app/cv-builder/create";
import CvEditorPage from "@/pages/app/cv-builder/[id]";
import OpportunitiesPage from "@/pages/app/opportunities";
import JobDetailPage from "@/pages/app/opportunities/[id]";
import CareerInsightsPage from "@/pages/app/insights";
import PortfolioBuilderPage from "@/pages/app/portfolio";
import ProjectsListPage from "@/pages/app/projects";
import ProjectCreatePage from "@/pages/app/projects/create";
import ProjectDetailPage from "@/pages/app/projects/[id]";
import { PublicPortfolioPage } from "@/pages/portfolio/PublicPortfolioPage";
import { PortfolioRoot } from "@/pages/portfolio/PortfolioRoot";

function App() {
    useAuthBootstrap();

    return (
        <Routes>
            <Route path="/" element={<PortfolioRoot />} />
            <Route path="/user/:slug" element={<PublicPortfolioPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route element={<RequireAuth />}>
                <Route path="/app" element={<AppShellLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="insights" element={<CareerInsightsPage />} />
                    <Route path="cv" element={<CvListPage />} />
                    <Route path="cv-builder" element={<Navigate to="/app/cv" replace />} />
                    <Route path="portfolio" element={<PortfolioBuilderPage />} />
                    <Route path="opportunities" element={<OpportunitiesPage />} />
                    <Route path="opportunities/:id" element={<JobDetailPage />} />
                    <Route path="projects" element={<ProjectsListPage />} />
                    <Route path="projects/create" element={<ProjectCreatePage />} />
                    <Route path="projects/:id" element={<ProjectDetailPage />} />
                    <Route path="settings" element={<AppSectionPlaceholder sectionName="Settings" />} />
                    <Route path="cv/create" element={<CvCreatePage />} />
                    <Route path="cv/:id" element={<CvEditorPage />} />
                </Route>
                <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
