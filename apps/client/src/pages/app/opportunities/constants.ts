import type { ReactNode } from "react";
import { Globe, Briefcase, BookOpen, Leaf, Sparkles } from "lucide-react";
import React from "react";

export const API_BASE =
    (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000/api";

export const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    emploi:      { bg: "rgba(22,163,74,0.12)",  text: "#22c55e", dot: "#22c55e", border: "rgba(22,163,74,0.3)" },
    stage:       { bg: "rgba(2,132,199,0.12)",  text: "#38bdf8", dot: "#38bdf8", border: "rgba(2,132,199,0.3)" },
    pfe:         { bg: "rgba(139,92,246,0.12)", text: "#a78bfa", dot: "#a78bfa", border: "rgba(139,92,246,0.3)" },
    opportunite: { bg: "rgba(251,146,60,0.12)", text: "#fb923c", dot: "#fb923c", border: "rgba(251,146,60,0.3)" },
};

export const FALLBACK_COLORS = { bg: "rgba(255,255,255,0.06)", text: "#94a3b8", dot: "#94a3b8", border: "rgba(255,255,255,0.1)" };

export const SOURCE_ICONS: Record<string, ReactNode> = {
    entreprise_partenaire: React.createElement(Sparkles, { size: 16, color: "#16A34A" }),
    indeed:            React.createElement(Globe, { size: 16 }),
    linkedin:          React.createElement(Briefcase, { size: 16 }),
    welcometothejungle: React.createElement(Leaf, { size: 16 }),
    "pfebooks.com":    React.createElement(BookOpen, { size: 16 }),
};

export const SOURCE_LABELS: Record<string, string> = {
    entreprise_partenaire: "Partenaire Glybette", indeed: "Indeed", linkedin: "LinkedIn", welcometothejungle: "WTTJ", "pfebooks.com": "PFEBooks",
};

export const FILTER_LABELS: Record<string, Record<string, string>> = {
    type_offre:        { emploi: "Emploi", stage: "Stage", pfe: "PFE", opportunite: "Opportunité" },
    source:            { entreprise_partenaire: "Partenaire Glybette", indeed: "Indeed", linkedin: "LinkedIn", welcometothejungle: "WTTJ", "pfebooks.com": "PFEBooks" },
    date_posted:       { today: "Aujourd'hui", this_week: "Cette semaine", "3days": "3 derniers jours", this_hour: "Cette heure" },
    teletravail:       { remote: "Full Remote", hybrid: "Hybride", onsite: "Présentiel" },
    niveau_experience: { junior: "Junior", mid: "Intermédiaire", senior: "Senior" },
};

export function getTypeColors(type: string) {
    return TYPE_COLORS[type?.toLowerCase()] ?? FALLBACK_COLORS;
}

export function timeAgo(dateStr?: string | null): string {
    if (!dateStr) return "Récemment";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Récemment";
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 0) return "À l'instant";
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function scoreColor(score: number) {
    if (score >= 85) return "#22c55e";
    if (score >= 65) return "#f59e0b";
    return "#ef4444";
}

export function scoreLabel(score: number) {
    if (score >= 85) return "Excellent match";
    if (score >= 65) return "Bon match";
    return "Match partiel";
}

export function buildPageRange(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const r: (number | "…")[] = [1];
    if (current > 3) r.push("…");
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) r.push(p);
    if (current < total - 2) r.push("…");
    r.push(total);
    return r;
}