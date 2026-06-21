import type { ReactNode } from "react";
import type { TFunction } from "i18next";
import { Globe, Briefcase, BookOpen, Leaf, Sparkles } from "lucide-react";
import React from "react";

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

export function getFilterLabel(t: TFunction, category: string, value: string): string {
    const key = `constants.filterLabels.${category}.${value}`;
    const translated = t(key, { defaultValue: "" });
    return translated || value;
}

export function getSourceLabel(t: TFunction, source: string): string {
    return t(`constants.sourceLabels.${source}`, { defaultValue: source });
}

export function getScoreLabel(t: TFunction, score: number): string {
    if (score >= 85) return t("constants.scoreLabel.excellent");
    if (score >= 65) return t("constants.scoreLabel.good");
    return t("constants.scoreLabel.partial");
}

export function getTypeColors(type: string) {
    return TYPE_COLORS[type?.toLowerCase()] ?? FALLBACK_COLORS;
}

export function scoreColor(score: number) {
    if (score >= 85) return "#22c55e";
    if (score >= 65) return "#f59e0b";
    return "#ef4444";
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
