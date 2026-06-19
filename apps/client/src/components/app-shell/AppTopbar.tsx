import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationsMenu from "@/components/app-shell/NotificationsMenu";
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
                    <NotificationsMenu />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
