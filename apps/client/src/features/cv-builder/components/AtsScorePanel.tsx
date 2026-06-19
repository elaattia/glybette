import { useState } from "react";
import { Target, ChevronDown, ChevronUp, AlertCircle, Lightbulb, Sparkles, Loader, CheckCircle, CheckSquare, AlertTriangle, ArrowUpCircle } from "lucide-react";
import type { AtsScoreResult } from "../types/cv.types";

interface AtsScorePanelProps {
    score?: number;
    result: AtsScoreResult | null;
    isLoading: boolean;
    hasCvId: boolean;
    onCheck: (jobDescription: string) => void;
}

export function AtsScorePanel({ score, result, isLoading, hasCvId, onCheck }: AtsScorePanelProps) {
    const [expanded, setExpanded] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [jobDesc, setJobDesc] = useState("");

    const displayScore = result?.score ?? score;
    const color =
        displayScore == null ? "#7a9ab5" : displayScore >= 80 ? "#16A34A" : displayScore >= 60 ? "#ca8a04" : "#dc2626";

    const handleAnalyze = () => {
        if (!jobDesc.trim()) return;
        onCheck(jobDesc);
        setShowInput(false);
        setExpanded(true);
    };

    return (
        <div
            style={{
                background: "var(--gb-app-panel-bg)",
                border: "1px solid var(--gb-border)",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "10px",
            }}>
            <div
                onClick={() => setExpanded((v) => !v)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "11px 14px",
                    cursor: "pointer",
                    userSelect: "none",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <Target style={{ width: 14, height: 14, color }} />
                    <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--gb-text)" }}>ATS Score</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {displayScore != null && (
                        <span style={{ fontSize: "13px", fontWeight: 800, color }}>{displayScore}%</span>
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
                        }}>
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
                    {result?.suggestions?.[0] && (
                        <p style={{ margin: "5px 0 0", fontSize: "11px", color: "var(--gb-muted)" }}>
                            {result.suggestions[0]}
                        </p>
                    )}
                </div>
            )}

            {expanded && (
                <div style={{ padding: "0 14px 14px", borderTop: "1px solid var(--gb-border)", paddingTop: "12px" }}>
                    {!showInput && (
                        <button
                            onClick={() => setShowInput(true)}
                            disabled={!hasCvId}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "rgba(22,163,74,0.1)",
                                border: "1px solid rgba(22,163,74,0.25)",
                                color: "#16A34A",
                                borderRadius: "9px",
                                padding: "7px 12px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: hasCvId ? "pointer" : "not-allowed",
                                opacity: hasCvId ? 1 : 0.5,
                                marginBottom: result ? "12px" : 0,
                            }}>
                            <Sparkles style={{ width: 12, height: 12 }} />
                            {result ? "Analyser une autre offre" : "Analyser avec une offre"}
                        </button>
                    )}

                    {showInput && (
                        <div style={{ marginBottom: "12px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "var(--gb-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "6px",
                                }}>
                                Description du poste
                            </label>
                            <textarea
                                value={jobDesc}
                                onChange={(e) => setJobDesc(e.target.value)}
                                placeholder="Collez la description de l'offre ici..."
                                rows={4}
                                style={{
                                    width: "100%",
                                    background: "var(--gb-app-hover)",
                                    border: "1.5px solid var(--gb-border)",
                                    borderRadius: "10px",
                                    padding: "9px 12px",
                                    fontSize: "12px",
                                    color: "var(--gb-text)",
                                    resize: "vertical",
                                    outline: "none",
                                    fontFamily: "inherit",
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={(e) => (e.currentTarget.style.borderColor = "#16A34A")}
                                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--gb-border)")}
                            />
                            <div style={{ display: "flex", gap: "7px", marginTop: "7px" }}>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isLoading || !jobDesc.trim()}
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "5px",
                                        background: "linear-gradient(90deg, #16A34A, #0284C7)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "9px",
                                        padding: "8px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        cursor: isLoading || !jobDesc.trim() ? "not-allowed" : "pointer",
                                        opacity: !jobDesc.trim() ? 0.5 : 1,
                                    }}>
                                    {isLoading ? (
                                        <Loader
                                            style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }}
                                        />
                                    ) : (
                                        <Target style={{ width: 12, height: 12 }} />
                                    )}
                                    {isLoading ? "Analyse..." : "Analyser"}
                                </button>
                                <button
                                    onClick={() => setShowInput(false)}
                                    style={{
                                        background: "var(--gb-app-hover)",
                                        border: "1px solid var(--gb-border)",
                                        borderRadius: "9px",
                                        padding: "8px 12px",
                                        fontSize: "12px",
                                        color: "var(--gb-muted)",
                                        cursor: "pointer",
                                    }}>
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {result.breakdown && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "6px",
                                    }}>
                                    {Object.entries(result.breakdown).map(([key, val]) => {
                                        const labels: Record<string, string> = {
                                            keywordMatch: "Mots-clés",
                                            formatting: "Mise en forme",
                                            completeness: "Complétude",
                                            relevance: "Pertinence",
                                        };
                                        const c = val >= 80 ? "#16A34A" : val >= 60 ? "#ca8a04" : "#dc2626";
                                        return (
                                            <div
                                                key={key}
                                                style={{
                                                    background: "var(--gb-app-hover)",
                                                    borderRadius: "8px",
                                                    padding: "8px 10px",
                                                }}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        marginBottom: "4px",
                                                    }}>
                                                    <span style={{ fontSize: "10.5px", color: "var(--gb-muted)" }}>
                                                        {labels[key] ?? key}
                                                    </span>
                                                    <span style={{ fontSize: "11px", fontWeight: 700, color: c }}>
                                                        {val}%
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        height: "3px",
                                                        background: "var(--gb-border)",
                                                        borderRadius: "99px",
                                                        overflow: "hidden",
                                                    }}>
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
                                        }}>
                                        <AlertCircle style={{ width: 11, height: 11, color: "#ca8a04" }} />
                                        Mots-clés manquants
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
                                                }}>
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
                                        }}>
                                        <CheckCircle style={{ width: 11, height: 11, color: "#16A34A" }} />
                                        Mots-clés présents
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
                                                }}>
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
