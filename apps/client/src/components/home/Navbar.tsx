import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import logo from "@/assets/gyblette.png";
import { Sun, Moon, Menu, X, ArrowRight } from "lucide-react";

const styles = `
  .gb-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 0 40px; height: 68px;
    display: flex; align-items: center; justify-content: space-between;
    background: var(--gb-nav-bg);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--gb-border);
    transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
    font-family: 'DM Sans', sans-serif;
  }
  .gb-nav.scrolled {
    background: var(--gb-nav-bg-scroll);
    border-bottom-color: rgba(22,163,74,0.28);
    box-shadow: 0 4px 32px rgba(0,0,0,0.1);
  }
  .gb-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; letter-spacing: -0.02em;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 800; font-size: 1.35rem;
    background: linear-gradient(90deg, #96C32A, #115792);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .gb-logo img {
    width: 50px; height: 50px;
    object-fit: contain; display: block;
    transform: translateY(2px);
  }
  .gb-nav-links { display: flex; align-items: center; gap: 32px; }
  .gb-nav-links a {
    color: var(--gb-muted); font-size: 0.88rem; text-decoration: none;
    font-weight: 500; transition: color 0.2s; letter-spacing: 0.01em;
    position: relative;
  }
  .gb-nav-links a::after {
    content: '';
    position: absolute;
    width: 0; height: 2px;
    bottom: -4px; left: 0;
    background: linear-gradient(90deg, #16A34A, #0284C7);
    transition: width 0.3s ease;
  }
  .gb-nav-links a:hover { color: var(--gb-text); }
  .gb-nav-links a:hover::after { width: 100%; }

  .gb-nav-actions { display: flex; align-items: center; gap: 10px; }
  .gb-ghost {
    background: none; border: none; color: var(--gb-muted); font-size: 0.88rem;
    cursor: pointer; padding: 8px 16px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; transition: color 0.2s;
    text-decoration: none; display: inline-block;
  }
  .gb-ghost:hover { color: var(--gb-text); }
  .gb-cta-nav {
    background: linear-gradient(90deg, #16A34A, #0284C7);
    border: none; color: #fff; font-size: 0.88rem; font-weight: 600;
    cursor: pointer; padding: 9px 22px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; letter-spacing: 0.01em;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 0 24px rgba(22,163,74,0.28);
    text-decoration: none; display: inline-block;
  }
  .gb-cta-nav:hover {
    opacity: 0.9; transform: translateY(-1px);
    box-shadow: 0 6px 32px rgba(22,163,74,0.45);
  }
  .gb-theme-btn {
    width: 38px; height: 38px; border-radius: 10px;
    background: var(--gb-surface);
    border: 1px solid var(--gb-border2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 1rem; line-height: 1;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
    flex-shrink: 0;
  }
  .gb-theme-btn:hover {
    background: var(--gb-surface2);
    border-color: rgba(22,163,74,0.45);
    transform: scale(1.08);
  }
  .gb-hamburger {
    display: none; background: none;
    border: 1px solid var(--gb-border2);
    color: var(--gb-text); padding: 7px 11px; border-radius: 8px;
    cursor: pointer; line-height: 1;
    transition: border-color 0.2s;
  }
  .gb-hamburger:hover { border-color: rgba(22,163,74,0.5); }

  /* ── Overlay ── */
  .gb-overlay {
    position: fixed; inset: 0; z-index: 998;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  /* ── Side Drawer ── */
  .gb-drawer {
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: 280px;
    z-index: 999;
    background: var(--gb-drawer-bg);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-left: 1px solid var(--gb-border2);
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    box-shadow: -8px 0 32px rgba(0,0,0,0.3);
  }

  /* Header du drawer avec logo + croix */
  .gb-drawer-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--gb-border);
    height: 68px;
    box-sizing: border-box;
  }
  .gb-drawer-close {
    width: 36px; height: 36px;
    background: none;
    border: 1px solid var(--gb-border2);
    border-radius: 8px;
    color: var(--gb-text);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    flex-shrink: 0;
  }
  .gb-drawer-close:hover {
    border-color: rgba(22,163,74,0.5);
    background: var(--gb-surface);
  }

  /* Liens nav verticaux */
  .gb-drawer-links {
    display: flex; flex-direction: column;
    padding: 8px 20px;
    flex: 1;
  }
  .gb-drawer-links a {
    display: flex; align-items: center;
    color: var(--gb-text); font-size: 1rem; text-decoration: none;
    padding: 16px 4px;
    border-bottom: 1px solid var(--gb-border);
    transition: color 0.2s, padding-left 0.2s;
    font-weight: 500; letter-spacing: 0.01em;
    position: relative;
  }
  .gb-drawer-links a:last-child { border-bottom: none; }
  .gb-drawer-links a::before {
    content: '';
    width: 3px; height: 0;
    border-radius: 2px;
    background: linear-gradient(180deg, #16A34A, #0284C7);
    position: absolute; left: -4px; top: 50%; transform: translateY(-50%);
    transition: height 0.25s ease;
  }
  .gb-drawer-links a:hover { color: #16A34A; padding-left: 10px; }
  .gb-drawer-links a:hover::before { height: 60%; }

  /* Séparateur */
  .gb-drawer-sep {
    height: 1px;
    background: var(--gb-border);
    margin: 0 20px 16px;
  }

  /* Boutons d'action */
  .gb-drawer-btns {
    display: flex; flex-direction: column;
    gap: 10px; padding: 0 20px 24px;
  }
  .gb-drawer-btns .gb-ghost {
    width: 100%; text-align: center;
    border: 1px solid var(--gb-border2);
    border-radius: 10px; padding: 12px;
    font-size: 0.95rem;
  }
  .gb-drawer-btns .gb-ghost:hover {
    border-color: rgba(22,163,74,0.4);
    color: var(--gb-text);
  }
  .gb-drawer-btns .gb-cta-nav {
    width: 100%; text-align: center;
    padding: 13px; font-size: 0.95rem;
    border-radius: 12px;
    box-sizing: border-box;
  }

  @media (max-width: 860px) {
    .gb-nav { padding: 0 20px; }
    .gb-nav-links { display: none; }
    .gb-nav-actions .gb-ghost,
    .gb-nav-actions .gb-cta-nav { display: none; }
    .gb-hamburger { display: flex; align-items: center; }
  }
`;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <nav className={`gb-nav${scrolled ? " scrolled" : ""}`}>
        <a href="/" className="gb-logo">
          <img src={logo} alt="glybette logo" />
          Glybette
        </a>
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
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <a href="/login" className="gb-ghost">Log in</a>
          <a href="/onboarding" className="gb-cta-nav">Get Started →</a>
          {}
          <button className="gb-hamburger" onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {open && (
        <>
          {}
          <div className="gb-overlay" onClick={() => setOpen(false)} />

          {}
          <div className="gb-drawer">

            {}
            <div className="gb-drawer-header">
              <a href="/" className="gb-logo" style={{ fontSize: '1.1rem' }}
                onClick={() => setOpen(false)}>
                <img src={logo} alt="glybette logo" style={{ width: '34px', height: '34px' }} />
                Glybette
              </a>
              <button className="gb-drawer-close" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {}
            <div className="gb-drawer-links">
              <a href="#features"     onClick={() => setOpen(false)}>Features</a>
              <a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a>
              <a href="#pricing"      onClick={() => setOpen(false)}>Pricing</a>
            </div>

            <div className="gb-drawer-sep" />

            {}
            <div className="gb-drawer-btns">
              <a href="/login" className="gb-ghost">Log in</a>
              <a href="/onboarding" className="gb-cta-nav">
                Get Started <ArrowRight className="w-4 h-4 inline ml-1" />
              </a>
            </div>

          </div>
        </>
      )}
    </>
  );
}