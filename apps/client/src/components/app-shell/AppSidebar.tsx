import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLocalPreference } from "@/hooks/useLocalPreference";
import logo from "@/assets/gyblette.png";

const navItems = [
    { to: "/app/dashboard", label: "Dashboard", icon: Gauge },
    { to: "/app/insights", label: "Career Insights", icon: ChartColumnIncreasing },
    { to: "/app/cv", label: "CV Builder", icon: FileUser },
    { to: "/app/portfolio", label: "Portfolio", icon: FolderKanban },
    { to: "/app/opportunities", label: "Opportunities", icon: BriefcaseBusiness },
    { to: "/app/projects", label: "Projects", icon: Handshake },
    { to: "/app/settings", label: "Settings", icon: Settings },
];

type AppSidebarProps = {
    onNavigate?: () => void;
    /** Drawer overlay (mobile): full labels + width; ignores compact preference */
    layout?: "desktop" | "drawer";
};

export default function AppSidebar({ onNavigate, layout = "desktop" }: AppSidebarProps) {
    const [compact, setCompact] = useLocalPreference("app:sidebar-compact", false);
    const isCompact = layout === "drawer" ? false : compact;

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
                    to="/app/dashboard"
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
                        Glybette
                    </span>
                </NavLink>

                {layout === "desktop" ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-[var(--gb-muted)] hover:bg-[var(--gb-app-hover)] hover:text-[var(--gb-text)]"
                        aria-label={isCompact ? "Expand sidebar" : "Collapse sidebar"}
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
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            title={item.label}
                            aria-label={item.label}
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
                                {item.label}
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
                                aria-label="Upgrade now"
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] text-[#ca8a04] shadow-sm transition-[transform,box-shadow] duration-300 hover:bg-[var(--gb-app-hover)] hover:shadow-md">
                                <Crown className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                            Upgrade now
                        </TooltipContent>
                    </Tooltip>
                </div>
            ) : (
                <div className="mt-auto rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] p-4 transition-[padding,opacity] duration-300 ease-out">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gb-muted)]">
                        <ChartColumnIncreasing className="h-3.5 w-3.5 shrink-0 text-[#16A34A]" aria-hidden />
                        <span>Pro plan</span>
                    </div>
                    <p className="text-sm text-[var(--gb-text-off)]">
                        Unlock unlimited CV generations and interview coaching.
                    </p>
                    <button
                        type="button"
                        className="gb-btn-primary mt-3 inline-flex h-9 w-full items-center justify-center px-4 py-0 text-sm">
                        Upgrade now
                    </button>
                </div>
            )}
        </aside>
    );
}
