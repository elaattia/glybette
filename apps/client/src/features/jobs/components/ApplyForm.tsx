import { useState } from "react";
import { applicationsApi } from "../api/applications.api";
import { useLocale } from "@/hooks/useLocale";

interface ApplyFormProps {
    offreId: string;
    onSuccess?: () => void;
    onClose?: () => void;
}

export function ApplyForm({ offreId, onSuccess, onClose }: ApplyFormProps) {
    const { t } = useLocale("opportunities");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!resumeFile || !coverLetterFile) {
            setError(t("detail.applyForm.filesRequired"));
            setIsLoading(false);
            return;
        }

        try {
            await applicationsApi.submitApplication({
                offreId,
                resume: resumeFile,
                coverLetter: coverLetterFile,
            });
            setSuccess(true);
            setResumeFile(null);
            setCoverLetterFile(null);
            if (onSuccess) onSuccess();
            setTimeout(() => {
                if (onClose) onClose();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : t("detail.applyForm.genericError"));
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ padding: "24px", textAlign: "center", background: "#f0fdf4", borderRadius: "8px" }}>
                <div style={{ fontSize: "14px", color: "#16a34a", fontWeight: 600 }}>
                    {t("detail.applyForm.successTitle")}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
                    {t("detail.applyForm.successSubtitle")}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "var(--gb-text)" }}>
                    {t("detail.applyForm.resumeLabel")}
                </label>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                    style={{ width: "100%" }}
                    required
                />
            </div>

            <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "var(--gb-text)" }}>
                    {t("detail.applyForm.coverLetterLabel")}
                </label>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setCoverLetterFile(e.target.files?.[0] ?? null)}
                    style={{ width: "100%" }}
                    required
                />
            </div>

            {error && (
                <div style={{ fontSize: "12px", color: "#dc2626", background: "#fef2f2", padding: "10px 12px", borderRadius: "6px" }}>
                    {error}
                </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        style={{
                            padding: "8px 16px",
                            border: "1px solid var(--gb-border)",
                            background: "transparent",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            color: "var(--gb-text)",
                            opacity: isLoading ? 0.6 : 1,
                        }}
                    >
                        {t("detail.applyForm.cancel")}
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading || !resumeFile || !coverLetterFile}
                    style={{
                        padding: "8px 16px",
                        background: !isLoading && resumeFile && coverLetterFile ? "#16a34a" : "#d1d5db",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: !isLoading && resumeFile && coverLetterFile ? "pointer" : "not-allowed",
                        opacity: isLoading ? 0.6 : 1,
                    }}
                >
                    {isLoading ? t("detail.applyForm.submitting") : t("detail.applyForm.submit")}
                </button>
            </div>
        </form>
    );
}
