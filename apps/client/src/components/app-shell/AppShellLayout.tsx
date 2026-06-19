import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/app-shell/AppSidebar";
import AppTopbar from "@/components/app-shell/AppTopbar";

const routeMetaKeys: Record<string, { titleKey: string; subtitleKey: string }> = {
    "/app/dashboard": { titleKey: "routes.dashboard.title", subtitleKey: "routes.dashboard.subtitle" },
    "/app/insights": { titleKey: "routes.insights.title", subtitleKey: "routes.insights.subtitle" },
    "/app/cv": { titleKey: "routes.cv.title", subtitleKey: "routes.cv.subtitle" },
    "/app/cv/create": { titleKey: "routes.cvCreate.title", subtitleKey: "routes.cvCreate.subtitle" },
    "/app/portfolio": { titleKey: "routes.portfolio.title", subtitleKey: "routes.portfolio.subtitle" },
    "/app/opportunities": { titleKey: "routes.opportunities.title", subtitleKey: "routes.opportunities.subtitle" },
    "/app/projects": { titleKey: "routes.projects.title", subtitleKey: "routes.projects.subtitle" },
    "/app/projects/create": { titleKey: "routes.projectsCreate.title", subtitleKey: "routes.projectsCreate.subtitle" },
    "/app/settings": { titleKey: "routes.settings.title", subtitleKey: "routes.settings.subtitle" },
    "/app/enterprise": { titleKey: "routes.enterprise.title", subtitleKey: "routes.enterprise.subtitle" },
    "/app/admin": { titleKey: "routes.admin.title", subtitleKey: "routes.admin.subtitle" },
    "/app/admin/users": { titleKey: "routes.adminUsers.title", subtitleKey: "routes.adminUsers.subtitle" },
    "/app/admin/projects": { titleKey: "routes.adminProjects.title", subtitleKey: "routes.adminProjects.subtitle" },
    "/app/admin/jobs": { titleKey: "routes.adminJobs.title", subtitleKey: "routes.adminJobs.subtitle" },
    "/app/admin/portfolio": { titleKey: "routes.adminPortfolio.title", subtitleKey: "routes.adminPortfolio.subtitle" },
    "/app/admin/cv": { titleKey: "routes.adminCv.title", subtitleKey: "routes.adminCv.subtitle" },
    "/app/admin/scraping": { titleKey: "routes.adminScraping.title", subtitleKey: "routes.adminScraping.subtitle" },
    "/app/admin/notifications": {
        titleKey: "routes.adminNotifications.title",
        subtitleKey: "routes.adminNotifications.subtitle",
    },
};

export default function AppShellLayout() {
    const { t } = useTranslation("shell");
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const { title, subtitle } = useMemo(() => {
        const keys = routeMetaKeys[location.pathname];
        if (keys) {
            return { title: t(keys.titleKey), subtitle: t(keys.subtitleKey) };
        }
        if (/^\/app\/cv\/[^/]+$/.test(location.pathname)) {
            return { title: t("routes.cvEditor.title"), subtitle: t("routes.cvEditor.subtitle") };
        }
        if (/^\/app\/projects\/[^/]+$/.test(location.pathname)) {
            return { title: t("routes.projectDetails.title"), subtitle: t("routes.projectDetails.subtitle") };
        }
        return { title: t("routes.fallback.title"), subtitle: t("routes.fallback.subtitle") };
    }, [location.pathname, t]);

    return (
        <div className="min-h-screen bg-[var(--gb-bg)] text-[var(--gb-text)]">
            <div className="grid min-h-screen grid-cols-1 md:h-screen md:grid-cols-[auto_minmax(0,1fr)] md:overflow-hidden">
                <div className="hidden md:sticky md:top-0 md:block md:h-screen">
                    <AppSidebar />
                </div>

                <div className="relative md:h-screen md:overflow-y-auto">
                    <AppTopbar title={title} subtitle={subtitle} onMenuClick={() => setMobileOpen(true)} />
                    <main className="px-4 py-5 md:px-6 md:py-6">
                        <Outlet />
                    </main>
                </div>
            </div>

            {mobileOpen ? (
                <div className="fixed inset-0 z-40 md:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/55"
                        onClick={() => setMobileOpen(false)}
                        aria-label={t("topbar.closeNavigation")}
                    />
                    <div className="absolute left-0 top-0 h-full w-[285px]">
                        <AppSidebar layout="drawer" onNavigate={() => setMobileOpen(false)} />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
