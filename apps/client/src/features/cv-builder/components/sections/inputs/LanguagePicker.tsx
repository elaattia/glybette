import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Search } from "lucide-react";
import { inputCss } from "../primitives";

const LANGUAGES_LIST = [
    "Arabe","Français","Anglais","Allemand","Espagnol","Italien","Portugais",
    "Chinois (Mandarin)","Japonais","Coréen","Russe","Turc","Persan","Hindi",
    "Bengali","Néerlandais","Polonais","Suédois","Norvégien","Danois","Finnois",
    "Grec","Tchèque","Hongrois","Roumain","Ukrainien","Hébreu","Thaï",
    "Vietnamien","Indonésien","Malaisien","Swahili",
];

interface LanguagePickerProps {
    value: string;
    onChange: (v: string) => void;
}

export function LanguagePicker({ value, onChange }: LanguagePickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const filtered = LANGUAGES_LIST.filter((l) => l.toLowerCase().includes(search.toLowerCase()));

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                type="button"
                onClick={() => { setOpen((o) => !o); setSearch(""); }}
                style={{ ...inputCss, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", borderColor: open ? "#16A34A" : "var(--gb-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Globe style={{ width: 13, height: 13, color: "var(--gb-muted)", flexShrink: 0 }} />
                    <span style={{ color: value ? "var(--gb-text)" : "var(--gb-muted)", fontSize: "13px" }}>
                        {value || "Sélectionner une langue"}
                    </span>
                </div>
                <ChevronDown style={{ width: 13, height: 13, color: "var(--gb-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {open && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100, background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "12px", boxShadow: "0 12px 36px rgba(0,0,0,0.2)", maxHeight: "240px", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "8px", borderBottom: "1px solid var(--gb-border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "var(--gb-app-hover)", borderRadius: "8px", padding: "6px 10px" }}>
                            <Search style={{ width: 12, height: 12, color: "var(--gb-muted)", flexShrink: 0 }} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher une langue…"
                                style={{ background: "none", border: "none", outline: "none", fontSize: "12px", color: "var(--gb-text)", width: "100%" }}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div style={{ overflowY: "auto", padding: "4px" }}>
                        {filtered.map((l) => (
                            <button key={l} type="button"
                                onClick={() => { onChange(l); setOpen(false); }}
                                style={{ width: "100%", textAlign: "left", padding: "7px 10px", background: value === l ? "rgba(22,163,74,0.1)" : "transparent", color: value === l ? "#16A34A" : "var(--gb-text)", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "12.5px", fontWeight: value === l ? 600 : 400 }}
                                onMouseEnter={(e) => { if (value !== l) e.currentTarget.style.background = "var(--gb-app-hover)"; }}
                                onMouseLeave={(e) => { if (value !== l) e.currentTarget.style.background = "transparent"; }}>
                                {l}
                            </button>
                        ))}
                        {search && !LANGUAGES_LIST.includes(search) && (
                            <button type="button"
                                onClick={() => { onChange(search); setOpen(false); }}
                                style={{ width: "100%", textAlign: "left", padding: "7px 10px", background: "rgba(22,163,74,0.06)", color: "#16A34A", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "12.5px", fontWeight: 500 }}>
                                + Ajouter "{search}"
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}