import "@/styles/home/navbar.css";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/gyblette.png";
import { Sun, Moon, Menu, X, ArrowRight, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageMenuItems } from "@/components/shared/LanguageMenuItems";

export default function Navbar() {
    const { t } = useTranslation("landing");
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { theme, toggle } = useTheme();
    const auth = useAuth();

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    return (
        <>
            <nav className={`gb-nav${scrolled ? " scrolled" : ""}`}>
                <Link to="/" className="gb-logo">
                    <img src={logo} alt={t("navbar.logoAlt")} />
                    {t("navbar.brand")}
                </Link>
                <div className="gb-nav-links">
                    <a href="#features">{t("navbar.features")}</a>
                    <a href="#how-it-works">{t("navbar.howItWorks")}</a>
                    <a href="#pricing">{t("navbar.pricing")}</a>
                </div>
                <div className="gb-nav-actions">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="gb-theme-btn"
                                aria-label={t("navbar.selectLanguage")}
                                title={t("navbar.selectLanguage")}>
                                <Globe className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-40">
                            <LanguageMenuItems />
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <button
                        type="button"
                        className="gb-theme-btn"
                        onClick={toggle}
                        aria-label={t("navbar.toggleTheme")}
                        title={theme === "dark" ? t("navbar.switchToLight") : t("navbar.switchToDark")}>
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    {auth.isAuthenticated ? (
                        <Link to="/app/dashboard" className="gb-cta-nav">
                            {t("navbar.dashboard")}
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="gb-ghost">
                                {t("navbar.logIn")}
                            </Link>
                            <Link to="/onboarding" className="gb-cta-nav">
                                {t("navbar.getStarted")}
                            </Link>
                        </>
                    )}
                    <button className="gb-hamburger" onClick={() => setOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {open && (
                <>
                    <div className="gb-overlay" onClick={() => setOpen(false)} />

                    <div className="gb-drawer">
                        <div className="gb-drawer-header">
                            <Link to="/" className="gb-logo" onClick={() => setOpen(false)}>
                                <img src={logo} alt={t("navbar.logoAlt")} />
                                {t("navbar.brand")}
                            </Link>
                            <button className="gb-drawer-close" onClick={() => setOpen(false)}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="gb-drawer-links">
                            <a href="#features" onClick={() => setOpen(false)}>
                                {t("navbar.features")}
                            </a>
                            <a href="#how-it-works" onClick={() => setOpen(false)}>
                                {t("navbar.howItWorks")}
                            </a>
                            <a href="#pricing" onClick={() => setOpen(false)}>
                                {t("navbar.pricing")}
                            </a>
                        </div>

                        <div className="gb-drawer-sep" />

                        <div className="gb-drawer-lang">
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <button type="button" className="gb-drawer-lang-btn">
                                        <Globe className="h-4 w-4" />
                                        {t("navbar.selectLanguage")}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="min-w-40">
                                    <LanguageMenuItems onSelect={() => setOpen(false)} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="gb-drawer-btns">
                            {auth.isAuthenticated ? (
                                <Link to="/app/dashboard" className="gb-cta-nav" onClick={() => setOpen(false)}>
                                    {t("navbar.dashboard")}
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="gb-ghost" onClick={() => setOpen(false)}>
                                        {t("navbar.logIn")}
                                    </Link>
                                    <Link to="/onboarding" className="gb-cta-nav" onClick={() => setOpen(false)}>
                                        {t("navbar.getStarted").replace(" →", "")} <ArrowRight className="w-4 h-4 inline ml-1" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
