import { Sparkles } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { formatNumber } from "@/lib/locale-format";
import { listStyles as s } from "../styles";

interface StatsBarProps {
    visibleCount: number;
    total: number;
    recommendedCount: number;
}

export function StatsBar({ visibleCount, total, recommendedCount }: StatsBarProps) {
    const { t, locale } = useLocale("opportunities");

    return (
        <div style={s.statsBar}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gb-text)" }}>
                {t("list.statsBar.visibleOfTotal", {
                    visible: formatNumber(visibleCount, locale),
                    total: formatNumber(total, locale),
                })}
            </span>
            {recommendedCount > 0 && (
                <>
                    <div style={{ width: 1, height: 14, background: "var(--gb-border)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                        <Sparkles size={12} style={{ color: "#a78bfa" }} />
                        <span style={{ color: "#22c55e", fontWeight: 700 }}>{recommendedCount}</span>
                        <span style={{ color: "var(--gb-muted)" }}>{t("list.statsBar.recommended")}</span>
                    </div>
                </>
            )}
        </div>
    );
}
