import { useState } from "react";
import {
    ShieldCheck, ChevronDown, ChevronUp, Loader,
    AlertCircle, CheckCircle, Lightbulb, RefreshCw, Info,
    CheckSquare, AlertTriangle, ArrowUpCircle
} from "lucide-react";
import type { AtsScoreResult } from "../types/cv.types";

interface AtsScoreCvOnlyPanelProps {
    savedScore?: number;
    result: AtsScoreResult | null;
    isLoading: boolean;
    hasCvId: boolean;
    onCheck: () => void;
    defaultExpanded?: boolean;
}

const BREAKDOWN_LABELS: Record<string, string> = {
    keywordMatch: "Mots-clés",
    formatting: "Mise en forme",
    completeness: "Complétude",
    relevance: "Structure",
};

function scoreColor(score: number) {
    if (score >= 80) return "#16A34A";
    if (score >= 60) return "#ca8a04";
    return "#dc2626";
}

function scoreLabel(score: number) {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Bon";
    if (score >= 55) return "Passable";
    return "À améliorer";
}

export function AtsScoreCvOnlyPanel({
    savedScore,
    result,
    isLoading,
    hasCvId,
    onCheck,
    defaultExpanded,
}: AtsScoreCvOnlyPanelProps) {
    const [expanded, setExpanded] = useState(defaultExpanded ?? false);

    const displayScore = result?.score ?? savedScore;
    const color = displayScore != null ? scoreColor(displayScore) : "#7a9ab5";

    return (
        <div
            style={{
                background: "var(--gb-app-panel-bg)",
                border: "1px solid var(--gb-border)",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "10px",
            }}
        >
            <div
                onClick={() => setExpanded((v) => !v)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "11px 14px",
                    cursor: "pointer",
                    userSelect: "none",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <ShieldCheck style={{ width: 14, height: 14, color }} />
                    <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--gb-text)" }}>
                        Score ATS — Lisibilité du CV
                    </span>
                    <span
                        title="Ce score mesure la compatibilité structurelle de votre CV avec les systèmes ATS, indépendamment de toute offre d'emploi."
                        style={{ cursor: "help", display: "flex" }}
                    >
                        <Info style={{ width: 11, height: 11, color: "var(--gb-muted)" }} />
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {displayScore != null && (
                        <>
                            <span
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    color,
                                    background: `${color}18`,
                                    border: `1px solid ${color}44`,
                                    borderRadius: "99px",
                                    padding: "2px 7px",
                                }}
                            >
                                {scoreLabel(displayScore)}
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: 800, color }}>{displayScore}/100</span>
                        </>
                    )}
                    {expanded ? (
                        <ChevronUp style={{ width: 13, height: 13, color: "var(--gb-muted)" }} />
                    ) : (
                        <ChevronDown style={{ width: 13, height: 13, color: "var(--gb-muted)" }} />
                    )}
                </div>
            </div>

            {displayScore != null && (
                <div style={{ padding: "0 14px 8px" }}>
                    <div
                        style={{
                            height: "5px",
                            background: "var(--gb-app-hover)",
                            borderRadius: "99px",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${displayScore}%`,
                                background: color,
                                borderRadius: "99px",
                                transition: "width 0.8s ease",
                            }}
                        />
                    </div>
                    {result?.suggestions?.[0] && !expanded && (
                        <p style={{ margin: "5px 0 0", fontSize: "10.5px", color: "var(--gb-muted)" }}>
                            {result.suggestions[0]}
                        </p>
                    )}
                </div>
            )}

            {expanded && (
                <div style={{ padding: "0 14px 14px", borderTop: "1px solid var(--gb-border)", paddingTop: "12px" }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onCheck(); }}
                        disabled={isLoading || !hasCvId}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: isLoading ? "rgba(22,163,74,0.06)" : "rgba(22,163,74,0.1)",
                            border: "1px solid rgba(22,163,74,0.25)",
                            color: "#16A34A",
                            borderRadius: "9px",
                            padding: "7px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: isLoading || !hasCvId ? "not-allowed" : "pointer",
                            opacity: !hasCvId ? 0.5 : 1,
                            marginBottom: result ? "12px" : 0,
                        }}
                    >
                        {isLoading ? (
                            <Loader style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
                        ) : (
                            <RefreshCw style={{ width: 12, height: 12 }} />
                        )}
                        {isLoading
                            ? "Analyse en cours…"
                            : result
                            ? "Ré-analyser"
                            : "Analyser la lisibilité ATS"}
                    </button>

                    {!hasCvId && (
                        <p style={{ fontSize: "11px", color: "var(--gb-muted)", marginTop: "6px" }}>
                            Sauvegardez votre CV pour activer l'analyse.
                        </p>
                    )}

                    {result && !isLoading && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {result.breakdown && (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                    {Object.entries(result.breakdown).map(([key, val]) => {
                                        const c = scoreColor(val);
                                        return (
                                            <div
                                                key={key}
                                                style={{
                                                    background: "var(--gb-app-hover)",
                                                    borderRadius: "8px",
                                                    padding: "8px 10px",
                                                }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                    <span style={{ fontSize: "10.5px", color: "var(--gb-muted)" }}>
                                                        {BREAKDOWN_LABELS[key] ?? key}
                                                    </span>
                                                    <span style={{ fontSize: "11px", fontWeight: 700, color: c }}>{val}%</span>
                                                </div>
                                                <div
                                                    style={{
                                                        height: "3px",
                                                        background: "var(--gb-border)",
                                                        borderRadius: "99px",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            height: "100%",
                                                            width: `${val}%`,
                                                            background: c,
                                                            borderRadius: "99px",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {result.missingKeywords.length > 0 && (
                                <div>
                                    <p
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            color: "var(--gb-muted)",
                                            margin: "0 0 6px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        <AlertCircle style={{ width: 11, height: 11, color: "#ca8a04" }} />
                                        Points à améliorer
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                        {result.missingKeywords.map((kw) => (
                                            <span
                                                key={kw}
                                                style={{
                                                    background: "rgba(202,138,4,0.1)",
                                                    border: "1px solid rgba(202,138,4,0.25)",
                                                    color: "#ca8a04",
                                                    borderRadius: "99px",
                                                    padding: "2px 8px",
                                                    fontSize: "11px",
                                                }}
                                            >
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.matchedKeywords.length > 0 && (
                                <div>
                                    <p
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            color: "var(--gb-muted)",
                                            margin: "0 0 6px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        <CheckCircle style={{ width: 11, height: 11, color: "#16A34A" }} />
                                        Éléments présents
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                        {result.matchedKeywords.map((kw) => (
                                            <span
                                                key={kw}
                                                style={{
                                                    background: "rgba(22,163,74,0.1)",
                                                    border: "1px solid rgba(22,163,74,0.25)",
                                                    color: "#16A34A",
                                                    borderRadius: "99px",
                                                    padding: "2px 8px",
                                                    fontSize: "11px",
                                                }}
                                            >
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(result as any).strengths && (result as any).strengths.length > 0 && (
                                <div>
                                    <p style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700, color: "var(--gb-muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        <CheckSquare style={{ width: 11, height: 11, color: "#16A34A" }} />
                                        Points forts
                                    </p>
                                    {(result as any).strengths.map((s: string, i: number) => (
                                        <div key={i} style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)", borderRadius: "8px", padding: "8px 10px", marginBottom: "5px", fontSize: "11.5px", color: "var(--gb-text-off)", lineHeight: 1.5 }}>
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(result as any).weaknesses && (result as any).weaknesses.length > 0 && (
                                <div>
                                    <p style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700, color: "var(--gb-muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        <AlertTriangle style={{ width: 11, height: 11, color: "#dc2626" }} />
                                        Points faibles
                                    </p>
                                    {(result as any).weaknesses.map((w: string, i: number) => (
                                        <div key={i} style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "8px", padding: "8px 10px", marginBottom: "5px", fontSize: "11.5px", color: "var(--gb-text-off)", lineHeight: 1.5 }}>
                                            {w}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(result as any).tips && (result as any).tips.length > 0 && (
                                <div>
                                    <p style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700, color: "var(--gb-muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        <Lightbulb style={{ width: 11, height: 11, color: "#0284C7" }} />
                                        Conseils d'amélioration
                                    </p>
                                    {(result as any).tips.map((t: string, i: number) => (
                                        <div key={i} style={{ background: "rgba(2,132,199,0.06)", border: "1px solid rgba(2,132,199,0.15)", borderRadius: "8px", padding: "8px 10px", marginBottom: "5px", fontSize: "11.5px", color: "var(--gb-text-off)", lineHeight: 1.5 }}>
                                            {t}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {result.suggestions && result.suggestions.length > 0 && (!(result as any).tips || (result as any).tips.length === 0) && (
                                <div>
                                    <p style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700, color: "var(--gb-muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        <ArrowUpCircle style={{ width: 11, height: 11, color: "#16A34A" }} />
                                        Suggestions
                                    </p>
                                    {result.suggestions.map((s: string, i: number) => (
                                        <div key={i} style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)", borderRadius: "8px", padding: "8px 10px", marginBottom: "5px", fontSize: "11.5px", color: "var(--gb-text-off)", lineHeight: 1.5 }}>
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}