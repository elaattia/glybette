import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/app-shell/AppSidebar";
import AppTopbar from "@/components/app-shell/AppTopbar";

const routeMeta: Record<string, { title: string; subtitle: string }> = {
    "/app/dashboard": {
        title: "Welcome back",
        subtitle: "Your opportunity pipeline is active and ready for updates.",
    },
    "/app/cv": {                               
        title: "CV Builder",
        subtitle: "Create and tailor CV versions for each target role.",
    },
    "/app/cv/create": {
        title: "New CV",
        subtitle: "Choose a template and start building.",
    },
    "/app/portfolio": {
        title: "Portfolio",
        subtitle: "Showcase projects with measurable outcomes and clear impact.",
    },
    "/app/opportunities": {
        title: "Opportunities",
        subtitle: "Track roles, interviews, and recruiter conversations in one place.",
    },
    "/app/projects": {
        title: "Projects",
        subtitle: "Look for projects to contribute to.",
    },
    "/app/settings": {
        title: "Settings",
        subtitle: "Control account preferences and workspace personalization.",
    },
};

export default function AppShellLayout() {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const { title, subtitle } = useMemo(() => {
        if (routeMeta[location.pathname]) return routeMeta[location.pathname];
        if (/^\/app\/cv\/[^/]+$/.test(location.pathname)) {
            return { title: "CV Editor", subtitle: "Edit, preview and export your CV." };
        }
        return { title: "Glybette workspace", subtitle: "Build your career assets and stay discoverable." };
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-[var(--gb-bg)] text-[var(--gb-text)]">
            <div className="grid min-h-screen grid-cols-1 md:h-screen md:grid-cols-[260px_minmax(0,1fr)] md:overflow-hidden">
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
                        aria-label="Close navigation panel"
                    />
                    <div className="absolute left-0 top-0 h-full w-[285px]">
                        <AppSidebar onNavigate={() => setMobileOpen(false)} />
                    </div>
                </div>
            ) : null}
        </div>
    );
}


