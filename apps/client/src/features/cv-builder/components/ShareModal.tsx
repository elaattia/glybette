import { useState } from "react";
import { X, Share2, Copy, Check, Link, Loader, Globe, Lock } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

interface ShareModalProps {
    cvId: string;
    shareToken?: string;
    isPublic?: boolean;
    onClose: () => void;
    onShare: (id: string) => Promise<{ shareToken: string; shareUrl: string }>;
    onRevoke: (id: string) => Promise<unknown>;
    onUpdate: (shareToken: string | undefined, isPublic: boolean) => void;
}

export function ShareModal({ cvId, shareToken, isPublic, onClose, onShare, onRevoke, onUpdate }: ShareModalProps) {
    const { t } = useLocale("cvBuilder");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : null;

    const handleShare = async () => {
        setLoading(true);
        try {
            const result = await onShare(cvId);
            onUpdate(result.shareToken, true);
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async () => {
        setLoading(true);
        try {
            await onRevoke(cvId);
            onUpdate(undefined, false);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!shareUrl) return;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 50,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(6px)",
                }}
                onClick={onClose}
            />
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 60,
                    width: "100%",
                    maxWidth: "420px",
                    background: "var(--gb-surface)",
                    border: "1px solid var(--gb-border)",
                    borderRadius: "20px",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                    animation: "modalIn 0.22s ease",
                    overflow: "hidden",
                    padding: "24px",
                }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "10px",
                                background: "rgba(22,163,74,0.12)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                            <Share2 style={{ width: 17, height: 17, color: "#16A34A" }} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--gb-text)" }}>
                                {t("share.title")}
                            </h2>
                            <p style={{ margin: 0, fontSize: "11.5px", color: "var(--gb-muted)" }}>
                                {t("share.subtitle")}
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

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        background: isPublic ? "rgba(22,163,74,0.08)" : "var(--gb-app-hover)",
                        border: `1px solid ${isPublic ? "rgba(22,163,74,0.2)" : "var(--gb-border)"}`,
                        marginBottom: "16px",
                    }}>
                    {isPublic ? (
                        <Globe style={{ width: 16, height: 16, color: "#16A34A", flexShrink: 0 }} />
                    ) : (
                        <Lock style={{ width: 16, height: 16, color: "var(--gb-muted)", flexShrink: 0 }} />
                    )}
                    <div>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--gb-text)" }}>
                            {isPublic ? t("share.publicCv") : t("share.privateCv")}
                        </p>
                        <p style={{ margin: 0, fontSize: "11.5px", color: "var(--gb-muted)" }}>
                            {isPublic ? t("share.publicDescription") : t("share.privateDescription")}
                        </p>
                    </div>
                </div>

                {isPublic && shareUrl && (
                    <div style={{ marginBottom: "16px" }}>
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
                            {t("share.shareLink")}
                        </label>
                        <div style={{ display: "flex", gap: "6px" }}>
                            <div
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    background: "var(--gb-app-hover)",
                                    border: "1px solid var(--gb-border)",
                                    borderRadius: "10px",
                                    padding: "9px 12px",
                                    overflow: "hidden",
                                }}>
                                <Link style={{ width: 13, height: 13, color: "var(--gb-muted)", flexShrink: 0 }} />
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "var(--gb-text-off)",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>
                                    {shareUrl}
                                </span>
                            </div>
                            <button
                                onClick={handleCopy}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    background: copied ? "rgba(22,163,74,0.12)" : "var(--gb-app-hover)",
                                    border: `1px solid ${copied ? "rgba(22,163,74,0.3)" : "var(--gb-border)"}`,
                                    borderRadius: "10px",
                                    padding: "9px 14px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: copied ? "#16A34A" : "var(--gb-text-off)",
                                    cursor: "pointer",
                                    flexShrink: 0,
                                    transition: "all 0.15s",
                                }}>
                                {copied ? (
                                    <Check style={{ width: 13, height: 13 }} />
                                ) : (
                                    <Copy style={{ width: 13, height: 13 }} />
                                )}
                                {copied ? t("share.copied") : t("share.copy")}
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {!isPublic ? (
                        <button
                            onClick={handleShare}
                            disabled={loading}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "7px",
                                background: "linear-gradient(90deg, #16A34A, #0284C7)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "12px",
                                padding: "11px",
                                fontSize: "13.5px",
                                fontWeight: 600,
                                cursor: loading ? "wait" : "pointer",
                            }}>
                            {loading ? (
                                <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                            ) : (
                                <Globe style={{ width: 14, height: 14 }} />
                            )}
                            {loading ? t("share.generating") : t("share.makePublic")}
                        </button>
                    ) : (
                        <button
                            onClick={handleRevoke}
                            disabled={loading}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "7px",
                                background: "transparent",
                                color: "#dc2626",
                                border: "1px solid rgba(220,38,38,0.3)",
                                borderRadius: "12px",
                                padding: "10px",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: loading ? "wait" : "pointer",
                            }}>
                            {loading ? (
                                <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                            ) : (
                                <Lock style={{ width: 14, height: 14 }} />
                            )}
                            {loading ? t("share.revoking") : t("share.revoke")}
                        </button>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes modalIn { from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
        </>
    );
}
