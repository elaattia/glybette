import React, { useState, useCallback } from "react";
import { Sparkles, Download, Copy, Send, Check } from "lucide-react";
import { detailStyles as styles } from "../styles";
import type { Offre } from "../types";

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000/api";

async function downloadCoverLetterPdf(content: string, filename: string) {
    try {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = document.createElement("div");
        element.style.cssText = `font-family:Georgia,serif;font-size:12pt;line-height:1.9;color:#111;padding:40px 50px;max-width:700px;white-space:pre-wrap;`;
        element.innerText = content;
        document.body.appendChild(element);
        await html2pdf()
            .set({ margin: 1, filename, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2, backgroundColor: "#fff" }, jsPDF: { unit: "in", format: "letter", orientation: "portrait" } })
            .from(element).save();
        document.body.removeChild(element);
    } catch {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = filename.replace(".pdf", ".txt"); a.click();
        URL.revokeObjectURL(url);
    }
}

interface CoverLetterTabProps {
    offre: Offre;
    profileText: string;
}

export function CoverLetterTab({ offre, profileText }: CoverLetterTabProps) {
    const [tone, setTone] = useState<"professional" | "enthusiastic" | "concise">("professional");
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const generateLetter = useCallback(async (selectedTone = tone) => {
        if (!offre._id) return;
        setLoading(true); setCoverLetter("");
        try {
            const cvText = profileText || "Profil candidat non renseigné";
            const res = await fetch(`${API_BASE}/jobs/cover-letter/generate`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ offreId: offre._id, cvText, tone: selectedTone, userAchievements: [] }),
            });
            const data = await res.json();
            setCoverLetter(data.content ?? "");
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [offre._id, profileText, tone]);

    const handleDownloadPdf = useCallback(async () => {
        if (!coverLetter) return;
        setDownloadingPdf(true);
        await downloadCoverLetterPdf(
            coverLetter,
            `Lettre_${(offre.entreprise ?? offre.titre).replace(/\s+/g, "_")}.pdf`,
        );
        setDownloadingPdf(false);
    }, [coverLetter, offre]);

    const copyLetter = () => {
        navigator.clipboard.writeText(coverLetter).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const toneLabels = { professional: "Formel", enthusiastic: "Enthousiaste", concise: "Concis" };

    return (
        <div style={styles.tabContent}>
            {/* Tone selector */}
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Ton de la lettre</div>
                <div style={styles.toneRow}>
                    {(["professional", "enthusiastic", "concise"] as const).map((t) => (
                        <button key={t} onClick={() => setTone(t)} style={styles.toneBtn(tone === t)}>
                            {toneLabels[t]}
                        </button>
                    ))}
                </div>
                <button onClick={() => generateLetter(tone)} disabled={loading} style={styles.generateFullBtn}>
                    {loading
                        ? <><div style={styles.spinnerXs} /> Génération...</>
                        : <><Sparkles size={14} /> {coverLetter ? "Regénérer" : "Générer la lettre"}</>
                    }
                </button>
            </div>

            {coverLetter && (
                <div style={styles.section}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={styles.sectionTitle}>Votre lettre de motivation</div>
                        <button onClick={copyLetter} style={styles.iconBtn}>
                            {copied ? <Check size={13} style={{ color: "#22c55e" }} /> : <Copy size={13} />}
                        </button>
                    </div>
                    <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        style={{ ...styles.textarea, minHeight: 380, fontFamily: "Georgia, serif", fontSize: 13.5, lineHeight: 1.9 }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        <button
                            onClick={handleDownloadPdf}
                            disabled={downloadingPdf}
                            style={{ ...styles.generateFullBtn, width: "auto", background: "linear-gradient(90deg,#a78bfa,#7c3aed)", boxShadow: "0 4px 18px rgba(139,92,246,0.3)", padding: "9px 20px" }}>
                            {downloadingPdf
                                ? <><div style={styles.spinnerXs} /> PDF...</>
                                : <><Download size={14} /> Télécharger PDF</>
                            }
                        </button>
                        <button onClick={copyLetter} style={styles.copyBtn}>
                            {copied ? "✓ Copié!" : <><Copy size={14} /> Copier</>}
                        </button>
                        {offre.email_contact && (
                            <a
                                href={`mailto:${offre.email_contact}?subject=Candidature : ${encodeURIComponent(offre.titre)}&body=${encodeURIComponent(coverLetter)}`}
                                style={styles.sendBtn}>
                                <Send size={14} /> Envoyer
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}