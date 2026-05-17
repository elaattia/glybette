import React from "react";
import { Sparkles } from "lucide-react";
import { listStyles as s } from "../styles";

interface StatsBarProps {
    visibleCount: number;
    total: number;
    scoredCount: number;
}

export function StatsBar({ visibleCount, total, scoredCount }: StatsBarProps) {
    return (
        <div style={s.statsBar}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gb-text)" }}>
                {visibleCount} affichées sur {total.toLocaleString("fr-FR")}
            </span>
            {scoredCount > 0 && (
                <>
                    <div style={{ width: 1, height: 14, background: "var(--gb-border)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                        <Sparkles size={12} style={{ color: "#a78bfa" }} />
                        <span style={{ color: "#22c55e", fontWeight: 700 }}>{scoredCount}</span>
                        <span style={{ color: "var(--gb-muted)" }}>matchées</span>
                    </div>
                </>
            )}
        </div>
    );
}