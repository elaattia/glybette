import "@/styles/home/navbar.css";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/gyblette.png";
import { Sun, Moon, Menu, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { theme, toggle } = useTheme();
    const auth = useAuth();

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    return (
        <>
            <nav className={`gb-nav${scrolled ? " scrolled" : ""}`}>
                <Link to="/" className="gb-logo">
                    <img src={logo} alt="glybette logo" />
                    Glybette
                </Link>
                <div className="gb-nav-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How it works</a>
                    <a href="#pricing">Pricing</a>
                </div>
                <div className="gb-nav-actions">
                    <button
                        className="gb-theme-btn"
                        onClick={toggle}
                        aria-label="Toggle theme"
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    {auth.isAuthenticated ? (
                        <Link to="/app/dashboard" className="gb-cta-nav">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="gb-ghost">
                                Log in
                            </Link>
                            <Link to="/onboarding" className="gb-cta-nav">
                                Get Started →
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
                                <img src={logo} alt="glybette logo" />
                                Glybette
                            </Link>
                            <button className="gb-drawer-close" onClick={() => setOpen(false)}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="gb-drawer-links">
                            <a href="#features" onClick={() => setOpen(false)}>
                                Features
                            </a>
                            <a href="#how-it-works" onClick={() => setOpen(false)}>
                                How it works
                            </a>
                            <a href="#pricing" onClick={() => setOpen(false)}>
                                Pricing
                            </a>
                        </div>

                        <div className="gb-drawer-sep" />

                        <div className="gb-drawer-btns">
                            {auth.isAuthenticated ? (
                                <Link to="/app/dashboard" className="gb-cta-nav" onClick={() => setOpen(false)}>
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="gb-ghost" onClick={() => setOpen(false)}>
                                        Log in
                                    </Link>
                                    <Link to="/onboarding" className="gb-cta-nav" onClick={() => setOpen(false)}>
                                        Get Started <ArrowRight className="w-4 h-4 inline ml-1" />
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
