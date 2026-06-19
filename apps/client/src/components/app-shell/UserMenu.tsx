import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, Globe, LogOut, MoonIcon, Settings, Shield, SunIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageMenuItems } from "@/components/shared/LanguageMenuItems";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { useLocale } from "@/hooks/useLocale";

export default function UserMenu() {
    const switchId = useId();
    const { t } = useTranslation("shell");
    const { locale } = useLocale("shell");
    const { theme, setTheme } = useTheme();
    const auth = useAuth();
    const { user } = useUser();
    const userLabel = auth.user?.name ?? auth.user?.email ?? t("common:user.unknown");
    const userEmail = auth.user?.email ?? t("common:user.noEmail");
    const fallback = userLabel.slice(0, 2).toUpperCase();
    const isDark = theme === "dark";
    const activeLanguageLabel = locale === "fr" ? t("common:language.fr") : t("common:language.en");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [languageOpen, setLanguageOpen] = useState(false);

    function handleUserMenuOpenChange(open: boolean) {
        setUserMenuOpen(open);
        if (!open) {
            setLanguageOpen(false);
        }
    }

    return (
        <DropdownMenu open={userMenuOpen} onOpenChange={handleUserMenuOpenChange} modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    className="h-10 rounded-xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] px-2.5 hover:bg-[var(--gb-app-hover)] cursor-pointer">
                    <Avatar size="sm">
                        <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-[140px] truncate text-xs text-[var(--gb-muted)]">{userLabel}</span>
                    <ChevronDown className="h-4 w-4 text-[var(--gb-muted)]" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    <p className="truncate text-sm font-semibold text-[var(--gb-text)]">{userLabel}</p>
                    <p className="truncate text-xs text-[var(--gb-muted)]">{userEmail}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onSelect={(event) => {
                        event.preventDefault();
                    }}
                    className="cursor-default justify-between">
                    <span className="text-sm font-medium text-[var(--gb-text-off)]">{t("userMenu.theme")}</span>
                    <div
                        className="group inline-flex items-center gap-2"
                        data-state={isDark ? "checked" : "unchecked"}
                        onClick={(event) => {
                            event.stopPropagation();
                        }}>
                        <button
                            id={`${switchId}-light`}
                            type="button"
                            className="cursor-pointer text-[#f59e0b] transition group-data-[state=checked]:opacity-65"
                            aria-controls={switchId}
                            onClick={() => setTheme("light")}>
                            <SunIcon className="size-4" aria-hidden="true" />
                        </button>
                        <Switch
                            id={switchId}
                            checked={isDark}
                            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                            aria-labelledby={`${switchId}-dark ${switchId}-light`}
                            aria-label={t("userMenu.toggleTheme")}
                            className="data-[state=unchecked]:bg-[#f59e0b] data-[state=checked]:bg-[#38bdf8]"
                        />
                        <button
                            id={`${switchId}-dark`}
                            type="button"
                            className="cursor-pointer text-[#38bdf8] transition group-data-[state=unchecked]:opacity-65"
                            aria-controls={switchId}
                            onClick={() => setTheme("dark")}>
                            <MoonIcon className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                </DropdownMenuItem>

                <DropdownMenu open={languageOpen} onOpenChange={() => undefined} modal={false}>
                    <DropdownMenuTrigger asChild>
                        <DropdownMenuItem
                            onSelect={(event) => {
                                event.preventDefault();
                                setLanguageOpen((open) => !open);
                            }}
                            className="cursor-pointer justify-between data-[state=open]:bg-[var(--gb-app-hover)]"
                            data-state={languageOpen ? "open" : "closed"}>
                            <Globe className="h-4 w-4" />
                            <span className="flex-1">{t("userMenu.language")}</span>
                            <span className="text-xs text-[var(--gb-muted)]">{activeLanguageLabel}</span>
                            <ChevronRight className="ml-auto h-4 w-4 text-[var(--gb-muted)]" />
                        </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="left"
                        align="start"
                        sideOffset={4}
                        className="min-w-40"
                        onPointerDownOutside={(event) => event.preventDefault()}
                        onInteractOutside={(event) => event.preventDefault()}
                        onFocusOutside={(event) => event.preventDefault()}>
                        <LanguageMenuItems onSelect={() => setLanguageOpen(false)} />
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/app/settings" className="cursor-pointer">
                        <Settings className="h-4 w-4" />
                        {t("userMenu.settings")}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user?.isAdmin ? (
                    <>
                        <DropdownMenuItem asChild>
                            <Link to="/app/admin" className="cursor-pointer">
                                <Shield className="h-4 w-4" />
                                {t("userMenu.adminDashboard")}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                ) : null}
                <DropdownMenuItem
                    disabled={auth.logoutMutation.isPending}
                    onSelect={() => {
                        void auth.logout();
                    }}
                    className="text-red-500 focus:bg-red-500/15 focus:text-red-500 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    {auth.logoutMutation.isPending ? t("userMenu.signingOut") : t("userMenu.signOut")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
