import React from "react";
import { Sparkles, RefreshCw, Check, AlertTriangle, Zap, Lightbulb } from "lucide-react";
import { detailStyles as styles } from "../styles";
import { scoreColor, scoreLabel } from "../constants";
import type { Matching } from "../types";

interface MatchingPanelProps {
    matching: Matching | null;
    loading: boolean;
    onRefresh: () => void;
}

export function MatchingPanel({ matching, loading, onRefresh }: MatchingPanelProps) {
    return (
        <div style={styles.matchCard}>
            <div style={styles.matchHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Sparkles size={16} style={{ color: "#a78bfa" }} />
                    <span style={styles.sectionTitle}>AI Match Score</span>
                </div>
                <button onClick={onRefresh} style={styles.refreshBtn} disabled={loading}>
                    <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                </button>
            </div>

            {loading ? (
                <div style={styles.loadingInline}>
                    <div style={styles.spinnerSm} />
                    <span style={{ color: "var(--gb-muted)", fontSize: 12 }}>Calcul en cours...</span>
                </div>
            ) : matching ? (
                <div>
                    <div style={styles.scoreRow}>
                        <div style={styles.scoreCircle(scoreColor(matching.score))}>
                            <span style={styles.scoreNum}>{matching.score}</span>
                            <span style={styles.scoreUnit}>%</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: scoreColor(matching.score), fontSize: 16, marginBottom: 4 }}>
                                {scoreLabel(matching.score)}
                            </div>
                            <p style={styles.explication}>{matching.explication}</p>
                        </div>
                    </div>

                    {matching.pointsForts.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                            <div style={styles.matchSectionTitle}>
                                <Check size={13} style={{ color: "#22c55e" }} /> Points forts
                            </div>
                            {matching.pointsForts.map((p, i) => (
                                <div key={i} style={styles.matchItem("success")}>
                                    <span style={styles.matchDot("#22c55e")} />{p}
                                </div>
                            ))}
                        </div>
                    )}

                    {matching.pointsFaibles.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                            <div style={styles.matchSectionTitle}>
                                <AlertTriangle size={13} style={{ color: "#f59e0b" }} /> Axes d'amélioration
                            </div>
                            {matching.pointsFaibles.map((p, i) => (
                                <div key={i} style={styles.matchItem("warn")}>
                                    <span style={styles.matchDot("#f59e0b")} />{p}
                                </div>
                            ))}
                        </div>
                    )}

                    {matching.skillsManquantes.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                            <div style={styles.matchSectionTitle}>
                                <Zap size={13} style={{ color: "#ef4444" }} /> Skills manquantes
                            </div>
                            <div style={styles.skillsRow}>
                                {matching.skillsManquantes.map((s, i) => (
                                    <span key={i} style={styles.skillBadge("missing")}>{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {matching.skillsCorrespondantes.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                            <div style={styles.matchSectionTitle}>
                                <Check size={13} style={{ color: "#22c55e" }} /> Skills correspondantes
                            </div>
                            <div style={styles.skillsRow}>
                                {matching.skillsCorrespondantes.map((s, i) => (
                                    <span key={i} style={styles.skillBadge("match")}>{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {matching.recommandations.length > 0 && (
                        <div style={styles.recommandationsBox}>
                            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "var(--gb-text)", display: "flex", alignItems: "center", gap: 5 }}>
                                <Lightbulb size={13} style={{ color: "#16a34a" }} /> Recommandations
                            </div>
                            {matching.recommandations.map((r, i) => (
                                <div key={i} style={{ fontSize: 12, color: "var(--gb-text-off)", marginBottom: 4, paddingLeft: 8, borderLeft: "2px solid rgba(22,163,74,0.4)" }}>
                                    {r}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div style={styles.loadingInline}>
                    <span style={{ color: "var(--gb-muted)", fontSize: 12 }}>Score non calculé</span>
                    <button onClick={onRefresh} style={styles.calcBtn}>Calculer</button>
                </div>
            )}
        </div>
    );
}