import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/app-shell/UserMenu";

type AppTopbarProps = {
    title: string;
    subtitle: string;
    onMenuClick: () => void;
};

export default function AppTopbar({ title, subtitle, onMenuClick }: AppTopbarProps) {
    return (
        <header className="sticky top-0 z-20 border-b border-[var(--gb-border)] bg-[var(--gb-app-topbar-bg)] px-4 py-4 backdrop-blur-xl md:px-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="font-['Bricolage_Grotesque'] text-xl font-bold text-[var(--gb-text)] md:text-2xl">
                        {title}
                    </p>
                    <p className="text-sm text-[var(--gb-muted)]">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon-sm" className="md:hidden" onClick={onMenuClick}>
                        <Menu className="h-4 w-4" />
                    </Button>

                    <div className="relative hidden md:block md:w-56 lg:w-64 xl:w-72">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gb-muted)]" />
                        <input
                            type="search"
                            placeholder="Search jobs, skills, companies..."
                            className="h-10 w-full rounded-xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] pl-9 pr-3 text-sm text-[var(--gb-text)] outline-none transition focus:border-[var(--gb-app-ring)]"
                        />
                    </div>

                    <Button type="button" variant="ghost" size="icon-sm">
                        <Bell className="h-4 w-4" />
                    </Button>
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
