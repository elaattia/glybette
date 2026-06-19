import { useState } from "react";
import { X, FileText, Loader, Copy, Check, Download } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

interface AiCoverLetterPanelProps {
    content: string;
    isLoading: boolean;
    hasCvId: boolean;
    error: string | null;
    onClose: () => void;
    onGenerate: (jobDescription: string, tone: "professional" | "enthusiastic" | "concise") => void;
}

const TONE_VALUES = ["professional", "enthusiastic", "concise"] as const;

export function AiCoverLetterPanel({
    content,
    isLoading,
    hasCvId,
    error,
    onClose,
    onGenerate,
}: AiCoverLetterPanelProps) {
    const { t } = useLocale("cvBuilder");
    const [jobDesc, setJobDesc] = useState("");
    const [tone, setTone] = useState<"professional" | "enthusiastic" | "concise">("professional");
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = t("ai.coverLetter.downloadFilename");
        a.click();
        URL.revokeObjectURL(url);
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
                    width: "460px",
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
                                background: "rgba(251,191,36,0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                            <FileText style={{ width: 15, height: 15, color: "#f59e0b" }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--gb-text)" }}>
                                {t("ai.coverLetter.title")}
                            </h3>
                            <p style={{ margin: 0, fontSize: "11px", color: "var(--gb-muted)" }}>
                                {t("ai.coverLetter.subtitle")}
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
                                marginBottom: "8px",
                            }}>
                            {t("ai.coverLetter.toneTitle")}
                        </label>
                        <div style={{ display: "flex", gap: "6px" }}>
                            {TONE_VALUES.map((toneValue) => (
                                <button
                                    key={toneValue}
                                    onClick={() => setTone(toneValue)}
                                    style={{
                                        flex: 1,
                                        padding: "8px 6px",
                                        borderRadius: "9px",
                                        border: tone === toneValue ? "1.5px solid #f59e0b" : "1px solid var(--gb-border)",
                                        background: tone === toneValue ? "rgba(251,191,36,0.1)" : "transparent",
                                        cursor: "pointer",
                                        textAlign: "center",
                                    }}>
                                    <div
                                        style={{
                                            fontSize: "11.5px",
                                            fontWeight: 600,
                                            color: tone === toneValue ? "#f59e0b" : "var(--gb-text)",
                                        }}>
                                        {t(`ai.coverLetter.tones.${toneValue}.label`)}
                                    </div>
                                    <div style={{ fontSize: "10px", color: "var(--gb-muted)", marginTop: "2px" }}>
                                        {t(`ai.coverLetter.tones.${toneValue}.desc`)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

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
                            {t("ai.coverLetter.jobDescription")}
                        </label>
                        <textarea
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                            placeholder={t("ai.coverLetter.jobDescriptionPlaceholder")}
                            rows={5}
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
                            onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--gb-border)")}
                        />
                    </div>

                    <button
                        onClick={() => jobDesc.trim() && onGenerate(jobDesc, tone)}
                        disabled={isLoading || !jobDesc.trim() || !hasCvId}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            background: "linear-gradient(90deg, #f59e0b, #ef4444)",
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
                            <FileText style={{ width: 14, height: 14 }} />
                        )}
                        {isLoading ? t("ai.coverLetter.generating") : t("ai.coverLetter.generate")}
                    </button>

                    {content && !isLoading && (
                        <div>
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
                                        color: "#f59e0b",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                    }}>
                                    {t("ai.coverLetter.generatedLetter")}
                                </span>
                                <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                        onClick={handleCopy}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            background: "transparent",
                                            border: "1px solid var(--gb-border)",
                                            borderRadius: "7px",
                                            padding: "4px 9px",
                                            fontSize: "11px",
                                            color: "var(--gb-muted)",
                                            cursor: "pointer",
                                        }}>
                                        {copied ? (
                                            <Check style={{ width: 11, height: 11 }} />
                                        ) : (
                                            <Copy style={{ width: 11, height: 11 }} />
                                        )}
                                        {copied ? t("ai.coverLetter.copied") : t("ai.coverLetter.copy")}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            background: "rgba(251,191,36,0.12)",
                                            border: "1px solid rgba(251,191,36,0.3)",
                                            borderRadius: "7px",
                                            padding: "4px 9px",
                                            fontSize: "11px",
                                            color: "#f59e0b",
                                            cursor: "pointer",
                                            fontWeight: 600,
                                        }}>
                                        <Download style={{ width: 11, height: 11 }} />
                                        {t("ai.coverLetter.download")}
                                    </button>
                                </div>
                            </div>
                            <div
                                style={{
                                    background: "var(--gb-app-hover)",
                                    border: "1px solid var(--gb-border)",
                                    borderRadius: "12px",
                                    padding: "16px",
                                    fontSize: "12px",
                                    color: "var(--gb-text)",
                                    lineHeight: 1.7,
                                    whiteSpace: "pre-wrap",
                                }}>
                                {content}
                            </div>
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
