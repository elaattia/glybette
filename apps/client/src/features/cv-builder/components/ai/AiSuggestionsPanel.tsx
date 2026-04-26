import { X, Sparkles, Lightbulb, Loader, RefreshCw } from "lucide-react";
import type { SuggestionsResult } from "../../types/cv.types";

interface AiSuggestionsPanelProps {
    suggestions: SuggestionsResult["suggestions"];
    isLoading: boolean;
    hasCvId: boolean;
    error: string | null;
    onClose: () => void;
    onRefresh: () => void;
}

const PRIORITY_STYLES = {
    high: { bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.25)", color: "#dc2626", label: "Haute" },
    medium: { bg: "rgba(202,138,4,0.1)", border: "rgba(202,138,4,0.25)", color: "#ca8a04", label: "Moyenne" },
    low: { bg: "rgba(22,163,74,0.1)", border: "rgba(22,163,74,0.25)", color: "#16A34A", label: "Faible" },
};

export function AiSuggestionsPanel({
    suggestions,
    isLoading,
    hasCvId,
    error,
    onClose,
    onRefresh,
}: AiSuggestionsPanelProps) {
    return (
        <>
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 40,
                    background: "rgba(0,0,0,0.3)",
                    backdropFilter: "blur(4px)",
                }}
                onClick={onClose}
            />

            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 50,
                    width: "400px",
                    background: "var(--gb-surface)",
                    borderLeft: "1px solid var(--gb-border)",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "-8px 0 32px rgba(0,0,0,0.2)",
                    animation: "slideIn 0.22s ease",
                }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "18px 20px",
                        borderBottom: "1px solid var(--gb-border)",
                        flexShrink: 0,
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                            style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "9px",
                                background: "rgba(167,139,250,0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                            <Sparkles style={{ width: 15, height: 15, color: "#a78bfa" }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--gb-text)" }}>
                                Suggestions d'amélioration
                            </h3>
                            <p style={{ margin: 0, fontSize: "11px", color: "var(--gb-muted)" }}>
                                Analyse intelligente de votre CV
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "var(--gb-app-hover)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "6px",
                            cursor: "pointer",
                            color: "var(--gb-muted)",
                            display: "flex",
                        }}>
                        <X style={{ width: 15, height: 15 }} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                    {error && (
                        <div
                            style={{
                                background: "rgba(220,38,38,0.08)",
                                border: "1px solid rgba(220,38,38,0.2)",
                                borderRadius: "10px",
                                padding: "10px 12px",
                                fontSize: "12px",
                                color: "#dc2626",
                                marginBottom: "12px",
                            }}>
                            {error}
                        </div>
                    )}

                    {isLoading && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    style={{
                                        height: "80px",
                                        borderRadius: "12px",
                                        background: "var(--gb-app-hover)",
                                        animation: "pulse 1.4s ease-in-out infinite",
                                        animationDelay: `${i * 0.1}s`,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {!isLoading && suggestions.length === 0 && !error && (
                        <div style={{ textAlign: "center", paddingTop: "48px" }}>
                            <div
                                style={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "16px",
                                    background: "rgba(167,139,250,0.12)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                }}>
                                <Lightbulb style={{ width: 26, height: 26, color: "#a78bfa" }} />
                            </div>
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: "var(--gb-muted)",
                                    marginBottom: "20px",
                                    lineHeight: 1.6,
                                    maxWidth: "260px",
                                    margin: "0 auto 20px",
                                }}>
                                Obtenez des suggestions personnalisées pour améliorer l'impact de votre CV.
                            </p>
                            <button
                                onClick={onRefresh}
                                disabled={!hasCvId}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "7px",
                                    background: "rgba(167,139,250,0.15)",
                                    border: "1px solid rgba(167,139,250,0.3)",
                                    color: "#a78bfa",
                                    borderRadius: "10px",
                                    padding: "10px 20px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    cursor: hasCvId ? "pointer" : "not-allowed",
                                    opacity: hasCvId ? 1 : 0.5,
                                }}>
                                <Sparkles style={{ width: 14, height: 14 }} />
                                Analyser mon CV
                            </button>
                            {!hasCvId && (
                                <p style={{ marginTop: "12px", fontSize: "11px", color: "var(--gb-muted)" }}>
                                    Sauvegardez d'abord votre CV pour activer cette fonctionnalité.
                                </p>
                            )}
                        </div>
                    )}

                    {!isLoading && suggestions.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {suggestions.map((s, i) => {
                                const pStyle = PRIORITY_STYLES[s.priority] ?? PRIORITY_STYLES.medium;
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            background: "var(--gb-app-hover)",
                                            border: "1px solid var(--gb-border)",
                                            borderRadius: "12px",
                                            padding: "14px",
                                        }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                marginBottom: "7px",
                                            }}>
                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    fontWeight: 700,
                                                    color: "#a78bfa",
                                                    background: "rgba(167,139,250,0.12)",
                                                    border: "1px solid rgba(167,139,250,0.2)",
                                                    borderRadius: "99px",
                                                    padding: "2px 8px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.06em",
                                                }}>
                                                {s.section}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    fontWeight: 600,
                                                    color: pStyle.color,
                                                    background: pStyle.bg,
                                                    border: `1px solid ${pStyle.border}`,
                                                    borderRadius: "99px",
                                                    padding: "2px 7px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.05em",
                                                }}>
                                                {pStyle.label}
                                            </span>
                                        </div>
                                        <p
                                            style={{
                                                margin: "0 0 5px",
                                                fontSize: "12.5px",
                                                fontWeight: 600,
                                                color: "var(--gb-text)",
                                            }}>
                                            {s.issue}
                                        </p>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "12px",
                                                color: "var(--gb-text-off)",
                                                lineHeight: 1.55,
                                            }}>
                                            {s.suggestion}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {(suggestions.length > 0 || error) && !isLoading && (
                    <div style={{ padding: "14px 20px", borderTop: "1px solid var(--gb-border)", flexShrink: 0 }}>
                        <button
                            onClick={onRefresh}
                            disabled={!hasCvId}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                background: "transparent",
                                border: "1px dashed var(--gb-border2)",
                                borderRadius: "10px",
                                padding: "9px",
                                fontSize: "12px",
                                color: "var(--gb-muted)",
                                cursor: "pointer",
                                transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)";
                                e.currentTarget.style.color = "#a78bfa";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "var(--gb-border2)";
                                e.currentTarget.style.color = "var(--gb-muted)";
                            }}>
                            <RefreshCw style={{ width: 12, height: 12 }} />
                            Rafraîchir l'analyse
                        </button>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
        </>
    );
}
