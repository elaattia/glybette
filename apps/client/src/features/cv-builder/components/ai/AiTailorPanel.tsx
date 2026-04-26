import { useState } from "react";
import { X, Wand2, Loader, Copy, Check } from "lucide-react";
import type { TailorResult } from "../../types/cv.types";

interface AiTailorPanelProps {
    result: TailorResult | null;
    isLoading: boolean;
    hasCvId: boolean;
    error: string | null;
    onClose: () => void;
    onTailor: (jobDescription: string) => void;
    onApplySummary?: (summary: string) => void;
}

export function AiTailorPanel({
    result,
    isLoading,
    hasCvId,
    error,
    onClose,
    onTailor,
    onApplySummary,
}: AiTailorPanelProps) {
    const [jobDesc, setJobDesc] = useState("");
    const [copied, setCopied] = useState(false);

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                    width: "420px",
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
                                background: "rgba(56,189,248,0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                            <Wand2 style={{ width: 15, height: 15, color: "#38bdf8" }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--gb-text)" }}>
                                Adapter à l'offre
                            </h3>
                            <p style={{ margin: 0, fontSize: "11px", color: "var(--gb-muted)" }}>
                                Personnalisez votre CV pour une offre ciblée
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

                    <div style={{ marginBottom: "14px" }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "var(--gb-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                marginBottom: "6px",
                            }}>
                            Description du poste
                        </label>
                        <textarea
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                            placeholder="Collez la description complète du poste ici..."
                            rows={6}
                            style={{
                                width: "100%",
                                background: "var(--gb-app-hover)",
                                border: "1.5px solid var(--gb-border)",
                                borderRadius: "10px",
                                padding: "10px 12px",
                                fontSize: "12px",
                                color: "var(--gb-text)",
                                resize: "vertical",
                                outline: "none",
                                fontFamily: "inherit",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "#38bdf8")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--gb-border)")}
                        />
                    </div>

                    <button
                        onClick={() => jobDesc.trim() && onTailor(jobDesc)}
                        disabled={isLoading || !jobDesc.trim() || !hasCvId}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            background: "linear-gradient(90deg, #38bdf8, #0284C7)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "10px",
                            padding: "10px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: isLoading || !jobDesc.trim() || !hasCvId ? "not-allowed" : "pointer",
                            opacity: !jobDesc.trim() || !hasCvId ? 0.6 : 1,
                            marginBottom: "16px",
                        }}>
                        {isLoading ? (
                            <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                        ) : (
                            <Wand2 style={{ width: 14, height: 14 }} />
                        )}
                        {isLoading ? "Adaptation en cours..." : "Adapter mon CV"}
                    </button>

                    {result && !isLoading && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {result.summary && (
                                <div
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
                                            justifyContent: "space-between",
                                            marginBottom: "8px",
                                        }}>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: 700,
                                                color: "#38bdf8",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                            }}>
                                            Résumé suggéré
                                        </span>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button
                                                onClick={() => handleCopy(result.summary)}
                                                style={{
                                                    background: "transparent",
                                                    border: "1px solid var(--gb-border)",
                                                    borderRadius: "6px",
                                                    padding: "3px 7px",
                                                    fontSize: "11px",
                                                    color: "var(--gb-muted)",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}>
                                                {copied ? (
                                                    <Check style={{ width: 11, height: 11 }} />
                                                ) : (
                                                    <Copy style={{ width: 11, height: 11 }} />
                                                )}
                                                Copier
                                            </button>
                                            {onApplySummary && (
                                                <button
                                                    onClick={() => onApplySummary(result.summary)}
                                                    style={{
                                                        background: "rgba(56,189,248,0.15)",
                                                        border: "1px solid rgba(56,189,248,0.3)",
                                                        borderRadius: "6px",
                                                        padding: "3px 9px",
                                                        fontSize: "11px",
                                                        color: "#38bdf8",
                                                        cursor: "pointer",
                                                        fontWeight: 600,
                                                    }}>
                                                    Appliquer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p
                                        style={{
                                            fontSize: "12px",
                                            color: "var(--gb-text-off)",
                                            lineHeight: 1.6,
                                            margin: 0,
                                        }}>
                                        {result.summary}
                                    </p>
                                </div>
                            )}

                            {result.suggestedSkills.length > 0 && (
                                <div
                                    style={{
                                        background: "var(--gb-app-hover)",
                                        border: "1px solid var(--gb-border)",
                                        borderRadius: "12px",
                                        padding: "14px",
                                    }}>
                                    <p
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            color: "#38bdf8",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                            margin: "0 0 8px",
                                        }}>
                                        Compétences à ajouter
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                        {result.suggestedSkills.map((s) => (
                                            <span
                                                key={s}
                                                style={{
                                                    background: "rgba(56,189,248,0.12)",
                                                    border: "1px solid rgba(56,189,248,0.25)",
                                                    color: "#38bdf8",
                                                    borderRadius: "99px",
                                                    padding: "3px 10px",
                                                    fontSize: "11.5px",
                                                }}>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.suggestedKeywords.length > 0 && (
                                <div
                                    style={{
                                        background: "var(--gb-app-hover)",
                                        border: "1px solid var(--gb-border)",
                                        borderRadius: "12px",
                                        padding: "14px",
                                    }}>
                                    <p
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            color: "#38bdf8",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                            margin: "0 0 8px",
                                        }}>
                                        Mots-clés importants
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                        {result.suggestedKeywords.map((k) => (
                                            <span
                                                key={k}
                                                style={{
                                                    background: "rgba(22,163,74,0.1)",
                                                    border: "1px solid rgba(22,163,74,0.25)",
                                                    color: "#16A34A",
                                                    borderRadius: "99px",
                                                    padding: "3px 10px",
                                                    fontSize: "11.5px",
                                                }}>
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
        </>
    );
}
