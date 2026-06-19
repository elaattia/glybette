import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    BriefcaseBusiness,
    ChartColumnIncreasing,
    Crown,
    FileUser,
    FolderKanban,
    Gauge,
    Handshake,
    PanelLeft,
    PanelLeftClose,
    Settings,
    Shield,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLocalPreference } from "@/hooks/useLocalPreference";
import { useUser } from "@/hooks/useUser";
import logo from "@/assets/gyblette.png";

const studentNavItems = [
    { to: "/app/dashboard", labelKey: "sidebar.nav.dashboard", icon: Gauge },
    { to: "/app/insights", labelKey: "sidebar.nav.careerInsights", icon: ChartColumnIncreasing },
    { to: "/app/cv", labelKey: "sidebar.nav.cvBuilder", icon: FileUser },
    { to: "/app/portfolio", labelKey: "sidebar.nav.portfolio", icon: FolderKanban },
    { to: "/app/opportunities", labelKey: "sidebar.nav.opportunities", icon: BriefcaseBusiness },
    { to: "/app/projects", labelKey: "sidebar.nav.projects", icon: Handshake },
] as const;
const enterpriseNavItems = [{ to: "/app/enterprise", labelKey: "sidebar.nav.enterprise", icon: BriefcaseBusiness }] as const;
const adminNavItems = [
    { to: "/app/admin", labelKey: "sidebar.nav.overview", icon: Shield, end: true },
    { to: "/app/admin/users", labelKey: "sidebar.nav.users", icon: Users },
    { to: "/app/admin/projects", labelKey: "sidebar.nav.projects", icon: Handshake },
    { to: "/app/admin/jobs", labelKey: "sidebar.nav.jobs", icon: BriefcaseBusiness },
    { to: "/app/admin/portfolio", labelKey: "sidebar.nav.portfolio", icon: FolderKanban },
    { to: "/app/admin/cv", labelKey: "sidebar.nav.cv", icon: FileUser },
    { to: "/app/admin/scraping", labelKey: "sidebar.nav.scraping", icon: ChartColumnIncreasing },
    { to: "/app/admin/notifications", labelKey: "sidebar.nav.notifications", icon: Settings },
] as const;

type AppSidebarProps = {
    onNavigate?: () => void;
    /** Drawer overlay (mobile): full labels + width; ignores compact preference */
    layout?: "desktop" | "drawer";
};

export default function AppSidebar({ onNavigate, layout = "desktop" }: AppSidebarProps) {
    const { t } = useTranslation("shell");
    const [compact, setCompact] = useLocalPreference("app:sidebar-compact", false);
    const location = useLocation();
    const { user } = useUser();
    const isCompact = layout === "drawer" ? false : compact;
    const isAdminRoute = location.pathname.startsWith("/app/admin");
    const navItems = isAdminRoute
        ? adminNavItems
        : user?.baseRole === "enterprise"
          ? enterpriseNavItems
          : studentNavItems;
    const homeLink = isAdminRoute ? "/app/admin" : user?.baseRole === "enterprise" ? "/app/enterprise" : "/app/dashboard";

    return (
        <aside
            className={cn(
                "flex h-full shrink-0 flex-col overflow-hidden border-r border-[var(--gb-border)] bg-[var(--gb-app-sidebar-bg)] py-5 transition-[width,padding] duration-300 ease-out",
                isCompact ? "w-[72px] px-2" : "w-[260px] px-4",
            )}>
            <div
                className={cn(
                    "mb-6 min-w-0",
                    isCompact ? "flex flex-col items-center gap-2" : "flex items-center justify-between gap-2",
                )}>
                <NavLink
                    to={homeLink}
                    className={cn(
                        "flex min-w-0 items-center gap-2 rounded-xl py-1.5 transition-opacity duration-300",
                        isCompact ? "w-full justify-center px-0" : "min-w-0 flex-1 px-2",
                    )}
                    onClick={onNavigate}>
                    <img src={logo} alt="" className="h-9 w-9 shrink-0 object-contain" aria-hidden />
                    <span
                        className={cn(
                            "font-['Bricolage_Grotesque'] text-xl font-extrabold tracking-tight text-[var(--gb-text)] transition-[opacity,max-width] duration-300 ease-out",
                            isCompact ? "sr-only max-w-0 overflow-hidden opacity-0" : "max-w-[160px] opacity-100",
                        )}>
                        {t("sidebar.brand")}
                    </span>
                </NavLink>

                {layout === "desktop" ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-[var(--gb-muted)] hover:bg-[var(--gb-app-hover)] hover:text-[var(--gb-text)]"
                        aria-label={isCompact ? t("sidebar.expand") : t("sidebar.collapse")}
                        aria-pressed={isCompact}
                        onClick={() => setCompact((c) => !c)}>
                        {isCompact ? (
                            <PanelLeft className="h-4 w-4" aria-hidden />
                        ) : (
                            <PanelLeftClose className="h-4 w-4" aria-hidden />
                        )}
                    </Button>
                ) : null}
            </div>

            <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const label = t(item.labelKey);
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={"end" in item ? item.end : undefined}
                            title={label}
                            aria-label={label}
                            onClick={onNavigate}
                            className={({ isActive }) =>
                                cn(
                                    "group flex items-center rounded-xl text-sm font-medium transition-[padding,gap] duration-300 ease-out",
                                    isCompact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                                    isActive
                                        ? "bg-[var(--gb-app-active-bg)] text-[var(--gb-text)] shadow-[inset_0_0_0_1px_var(--gb-app-active-border)]"
                                        : "text-[var(--gb-muted)] hover:bg-[var(--gb-app-hover)] hover:text-[var(--gb-text-off)]",
                                )
                            }>
                            <Icon className="h-4 w-4 shrink-0" aria-hidden />
                            <span
                                className={cn(
                                    "whitespace-nowrap transition-[opacity,max-width] duration-300 ease-out",
                                    isCompact
                                        ? "sr-only max-w-0 overflow-hidden opacity-0"
                                        : "max-w-[200px] opacity-100",
                                )}>
                                {label}
                            </span>
                        </NavLink>
                    );
                })}
            </nav>

            {isCompact ? (
                <div className="mt-auto flex justify-center transition-opacity duration-300 ease-out">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                aria-label={t("sidebar.upgradeNow")}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] text-[#ca8a04] shadow-sm transition-[transform,box-shadow] duration-300 hover:bg-[var(--gb-app-hover)] hover:shadow-md">
                                <Crown className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                            {t("sidebar.upgradeNow")}
                        </TooltipContent>
                    </Tooltip>
                </div>
            ) : (
                <div className="mt-auto rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] p-4 transition-[padding,opacity] duration-300 ease-out">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gb-muted)]">
                        <ChartColumnIncreasing className="h-3.5 w-3.5 shrink-0 text-[#16A34A]" aria-hidden />
                        <span>{t("sidebar.proPlan.label")}</span>
                    </div>
                    <p className="text-sm text-[var(--gb-text-off)]">{t("sidebar.proPlan.description")}</p>
                    <button
                        type="button"
                        className="gb-btn-primary mt-3 inline-flex h-9 w-full items-center justify-center px-4 py-0 text-sm">
                        {t("sidebar.proPlan.button")}
                    </button>
                </div>
            )}
        </aside>
    );
}
