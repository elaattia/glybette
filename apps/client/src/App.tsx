import { OnboardingPage } from "@/pages/onboarding";
import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "@/pages/login";
import { AuthCallbackPage } from "@/pages/login/AuthCallbackPage";
import { VerifyEmailPage } from "@/pages/login/VerifyEmailPage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireAdmin, RequireBaseRole } from "@/components/auth/RequireRole";
import { useAuthBootstrap } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import AppShellLayout from "@/components/app-shell";
import DashboardPage from "@/pages/app/dashboard";
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
import SettingsPage from "@/pages/app/settings";
import EnterpriseDashboardPage from "@/pages/app/enterprise";
import EnterpriseApplicationsPage from "@/pages/app/enterprise/applications";
import AdminDashboardPage from "@/pages/app/admin";
import AdminUsersManagementPage from "@/pages/app/admin/users";
import AdminProjectsManagementPage from "@/pages/app/admin/projects";
import AdminJobsManagementPage from "@/pages/app/admin/jobs";
import AdminPortfolioManagementPage from "@/pages/app/admin/portfolio";
import AdminCvManagementPage from "@/pages/app/admin/cv";
import AdminScrapingManagementPage from "@/pages/app/admin/scraping";
import AdminNotificationsManagementPage from "@/pages/app/admin/notifications";

function AppHomeRedirect() {
    const { user, isPending } = useUser();
    if (isPending) {
        return null;
    }
    if (user?.baseRole === "enterprise") {
        return <Navigate to="/app/enterprise" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
}

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
                    <Route index element={<AppHomeRedirect />} />
                    <Route path="enterprise" element={<EnterpriseDashboardPage />} />
                    <Route path="enterprise/applications" element={<EnterpriseApplicationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />

                    <Route element={<RequireBaseRole allowed={["student"]} redirectTo="/app/enterprise" />}>
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
                        <Route path="cv/create" element={<CvCreatePage />} />
                        <Route path="cv/:id" element={<CvEditorPage />} />
                    </Route>

                    <Route element={<RequireAdmin redirectTo="/app" />}>
                        <Route path="admin" element={<AdminDashboardPage />} />
                        <Route path="admin/users" element={<AdminUsersManagementPage />} />
                        <Route path="admin/projects" element={<AdminProjectsManagementPage />} />
                        <Route path="admin/jobs" element={<AdminJobsManagementPage />} />
                        <Route path="admin/portfolio" element={<AdminPortfolioManagementPage />} />
                        <Route path="admin/cv" element={<AdminCvManagementPage />} />
                        <Route path="admin/scraping" element={<AdminScrapingManagementPage />} />
                        <Route path="admin/notifications" element={<AdminNotificationsManagementPage />} />
                    </Route>
                </Route>
                <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
