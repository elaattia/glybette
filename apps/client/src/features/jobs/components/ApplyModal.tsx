import { ApplyForm } from "./ApplyForm";

interface ApplyModalProps {
    isOpen: boolean;
    offreId: string;
    offreTitle?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export function ApplyModal({ isOpen, offreId, offreTitle, onClose, onSuccess }: ApplyModalProps) {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "var(--gb-card-bg)",
                    borderRadius: "8px",
                    padding: "24px",
                    maxWidth: "500px",
                    width: "90%",
                    boxShadow: "0 20px 25px rgba(0, 0, 0, 0.1)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--gb-text)" }}>
                            Postuler à cette offre
                        </h2>
                        {offreTitle && (
                            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--gb-muted)" }}>
                                {offreTitle}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "20px",
                            cursor: "pointer",
                            color: "var(--gb-muted)",
                            padding: "0",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ✕
                    </button>
                </div>

                <ApplyForm offreId={offreId} onClose={onClose} onSuccess={onSuccess} />
            </div>
        </div>
    );
}
