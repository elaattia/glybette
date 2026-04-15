import { NavLink } from "react-router-dom";
import {
  BriefcaseBusiness,
  ChartColumnIncreasing,
  FileUser,
  FolderKanban,
  Gauge,
  Handshake,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/gyblette.png";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/app/cv-builder", label: "CV Builder", icon: FileUser },
  { to: "/app/portfolio", label: "Portfolio", icon: FolderKanban },
  { to: "/app/opportunities", label: "Opportunities", icon: BriefcaseBusiness },
  { to: "/app/projects", label: "Projects", icon: Handshake },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

type AppSidebarProps = {
  onNavigate?: () => void;
};

export default function AppSidebar({ onNavigate }: AppSidebarProps) {
  return (
    <aside className="flex h-full flex-col border-r border-[var(--gb-border)] bg-[var(--gb-app-sidebar-bg)] px-4 py-5">
      <NavLink
        to="/app/dashboard"
        className="mb-6 flex items-center gap-2 rounded-xl px-2 py-1.5"
        onClick={onNavigate}
      >
        <img src={logo} alt="Glybette logo" className="h-9 w-9 object-contain" />
        <span className="font-['Bricolage_Grotesque'] text-xl font-extrabold tracking-tight text-[var(--gb-text)]">
          Glybette
        </span>
      </NavLink>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-[var(--gb-app-active-bg)] text-[var(--gb-text)] shadow-[inset_0_0_0_1px_var(--gb-app-active-border)]"
                    : "text-[var(--gb-muted)] hover:bg-[var(--gb-app-hover)] hover:text-[var(--gb-text-off)]",
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] p-4">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gb-muted)]">
          <ChartColumnIncreasing className="h-3.5 w-3.5 text-[#16A34A]" />
          Pro plan
        </div>
        <p className="text-sm text-[var(--gb-text-off)]">
          Unlock unlimited CV generations and interview coaching.
        </p>
        <button className="gb-btn-primary mt-3 h-9 w-full justify-center px-4 py-0 text-sm">
          Upgrade now
        </button>
      </div>
    </aside>
  );
}
