import React, { useState, useCallback } from "react";
import { FileText, Brain, Key, Edit3, Target, Rocket, Check, RefreshCw, Lightbulb, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CV_LIST_KEY } from "@/features/cv-builder/hooks/useCvList";
import { detailStyles as styles } from "../styles";
import { scoreColor } from "../constants";
import type { Offre, CvImprovement } from "../types";

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000/api";

function buildTailoredSections(tailoredData: any, userProfile: any, offre: Offre) {
    const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

    const sections: any[] = [
        {
            type: "personal-info", order: 0,
            data: {
                firstName: userProfile.firstName ?? "",
                lastName:  userProfile.lastName  ?? "",
                roleTitle: tailoredData?.personalInfo?.roleTitle ?? userProfile.roleTitle ?? offre.titre,
                email:     userProfile.email   ?? "",
                phone:     userProfile.phone   ?? "",
                location:  userProfile.country ?? "",
                linkedin: "", github: "", portfolio: "",
            },
        },
        {
            type: "summary", order: 1,
            data: {
                text: tailoredData?.summary ?? userProfile.summary
                    ?? `Candidat motivé pour le poste de ${offre.titre}${offre.entreprise ? ` chez ${offre.entreprise}` : ""}. ${offre.competences?.slice(0, 3).join(", ") ? `Maîtrise de ${offre.competences.slice(0, 3).join(", ")}.` : ""}`,
            },
        },
    ];

    const experiences = tailoredData?.experience?.length ? tailoredData.experience : (userProfile.experience ?? []);
    sections.push({
        type: "experience", order: 2,
        data: experiences.map((e: any) => ({
            id: uid(), company: e.company ?? "", position: e.position ?? "",
            startDate: e.startDate ?? "", endDate: e.endDate ?? "", current: e.current ?? false,
            location: e.location ?? "", description: e.description ?? "", highlights: [],
        })),
    });

    const education = userProfile.education ?? [];
    if (userProfile.university || education.length > 0) {
        const eduData = education.length > 0 ? education : [{
            institution: userProfile.university ?? "", degree: userProfile.degree ?? "",
            field: userProfile.specialization ?? "", startDate: "",
            endDate: userProfile.graduationYear ?? "", current: false, gpa: "",
        }];
        sections.push({ type: "education", order: 3, data: eduData.map((e: any) => ({ id: uid(), ...e })) });
    }

    const baseSkills      = userProfile.skills    ?? [];
    const suggestedSkills = tailoredData?.skills  ?? [];
    const offreSkills     = offre.competences     ?? [];
    const skillGroups: any[] = [];

    if (suggestedSkills.length > 0) {
        skillGroups.push(...suggestedSkills.map((g: any) => ({ id: uid(), category: g.category ?? "Compétences", skills: g.skills ?? [] })));
    } else {
        if (baseSkills.length > 0) skillGroups.push({ id: uid(), category: "Compétences techniques", skills: baseSkills });
        const newSkills = offreSkills.filter((s: string) => !baseSkills.includes(s));
        if (newSkills.length > 0)  skillGroups.push({ id: uid(), category: "Compétences requises", skills: newSkills.slice(0, 6) });
    }
    if (skillGroups.length > 0) sections.push({ type: "skills", order: 4, data: skillGroups });

    if (userProfile.languages?.length > 0) {
        sections.push({ type: "languages", order: 5, data: userProfile.languages.map((l: any) => ({ id: uid(), language: l.language ?? "", level: l.level ?? "B2" })) });
    }

    return sections;
}

interface CvAdaptTabProps {
    offre: Offre;
    userProfile: any;
    profileText: string;
    matchScore?: number;
}

export function CvAdaptTab({ offre, userProfile, profileText, matchScore }: CvAdaptTabProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [uploadedCvText, setUploadedCvText]     = useState("");
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [parsingFile, setParsingFile]           = useState(false);
    const [cvImprovements, setCvImprovements]     = useState<CvImprovement | null>(null);
    const [loadingCvImp, setLoadingCvImp]         = useState(false);
    const [creatingCv, setCreatingCv]             = useState(false);
    const [cvCreated, setCvCreated]               = useState<string | null>(null);

    const handleCvFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedFileName(file.name);
        setParsingFile(true);
        setCvImprovements(null);
        try {
            if (file.type === "text/plain") {
                setUploadedCvText(await file.text());
            } else {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch(`${API_BASE}/cvs/extract-text`, { method: "POST", credentials: "include", body: formData });
                if (res.ok) {
                    const data = await res.json();
                    setUploadedCvText(data.text ?? "");
                } else {
                    setUploadedCvText(await file.text().catch(() => ""));
                }
            }
        } catch {
            setUploadedCvText(await file.text().catch(() => ""));
        } finally { setParsingFile(false); }
    }, []);

    const getCvImprovements = useCallback(async () => {
        if (!offre._id || cvImprovements) return;
        setLoadingCvImp(true);
        try {
            const cvText = uploadedCvText || profileText || "Profil candidat non renseigné";
            const res = await fetch(`${API_BASE}/jobs/matching/cv-improvements`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ offreId: offre._id, cvText }),
            });
            const data = await res.json();
            setCvImprovements({
                ...data,
                atsScoreEstimate: matchScore ?? 0,
                keywordsToAdd: data.suggestedSkillsToAdd ?? [],
            });
        } catch (e) { console.error(e); }
        finally { setLoadingCvImp(false); }
    }, [offre._id, cvImprovements, uploadedCvText, profileText, matchScore]);

    const createTailoredCv = useCallback(async () => {
        if (!offre._id) return;
        setCreatingCv(true); setCvCreated(null);
        try {
            const cvText    = uploadedCvText || profileText || "Profil candidat non renseigné";
            const offreText = `${offre.titre}\n${offre.entreprise ?? ""}\n${offre.description ?? ""}\nCompétences: ${offre.competences?.join(", ")}\nNiveau: ${offre.niveau_experience ?? ""}\nContrat: ${offre.type_contrat ?? ""}`;

            let tailoredData: any = null;
            try {
                const aiRes = await fetch(`${API_BASE}/jobs/cv-tailored-sections`, {
                    method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                    body: JSON.stringify({ cvText, offreText }),
                });
                if (aiRes.ok) tailoredData = await aiRes.json();
            } catch (e) { console.warn("AI tailoring failed:", e); }

            const sections = buildTailoredSections(tailoredData, userProfile, offre);
            const cvTitle  = `CV adapté - ${offre.titre}${offre.entreprise ? ` chez ${offre.entreprise}` : ""}`;

            const createRes = await fetch(`${API_BASE}/cvs`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ title: cvTitle, template: "modern-strategy", sections }),
            });
            if (!createRes.ok) throw new Error(await createRes.text());

            const { cv } = await createRes.json();
            queryClient.invalidateQueries({ queryKey: CV_LIST_KEY });
            setCvCreated(cv._id);
            setTimeout(() => navigate(`/app/cv/${cv._id}`), 1500);
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la création du CV. Veuillez réessayer.");
        } finally { setCreatingCv(false); }
    }, [offre, uploadedCvText, profileText, userProfile, queryClient, navigate]);

    return (
        <div style={styles.tabContent}>
            <div style={styles.section}>
                <div style={styles.sectionTitle}>
                    <FileText size={14} style={{ marginRight: 6 }} />Importer votre CV
                </div>
                <p style={{ fontSize: 12, color: "var(--gb-muted)", marginBottom: 12 }}>
                    Uploadez votre CV (PDF, DOCX ou TXT) pour des recommandations personnalisées.
                </p>
                <label style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "24px 20px", borderRadius: 14, cursor: "pointer", marginBottom: 16,
                    border: `2px dashed ${uploadedCvText ? "rgba(22,163,74,0.5)" : "var(--gb-border)"}`,
                    background: uploadedCvText ? "rgba(22,163,74,0.04)" : "var(--gb-bg3)",
                }}>
                    <input type="file" accept=".pdf,.docx,.doc,.txt" style={{ display: "none" }} onChange={handleCvFileUpload} />
                    {parsingFile ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            <div style={styles.spinnerSm} />
                            <span style={{ fontSize: 13, color: "var(--gb-muted)" }}>Lecture du fichier...</span>
                        </div>
                    ) : uploadedCvText ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(22,163,74,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FileText size={18} style={{ color: "#22c55e" }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>{uploadedFileName}</span>
                            <span style={{ fontSize: 11, color: "var(--gb-muted)" }}>{uploadedCvText.length} caractères · Cliquez pour changer</span>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gb-app-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FileText size={20} style={{ color: "var(--gb-muted)" }} />
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gb-text)", marginBottom: 2 }}>Glissez-déposez votre CV ici</div>
                                <div style={{ fontSize: 11, color: "var(--gb-muted)" }}>PDF, DOCX, TXT · max 5 MB</div>
                            </div>
                        </div>
                    )}
                </label>
            </div>

            {loadingCvImp ? (
                <div style={styles.loadingBlock}>
                    <div style={styles.spinnerSm} />
                    <p style={{ color: "var(--gb-muted)", fontSize: 13 }}>Analyse de votre CV...</p>
                </div>
            ) : cvImprovements ? (
                <div>
                    {(cvImprovements.atsScoreEstimate ?? 0) > 0 && (
                        <div style={{ marginBottom: 20, padding: 16, borderRadius: 12, background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.18)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ ...styles.scoreCircle(scoreColor(cvImprovements.atsScoreEstimate!)), width: 56, height: 56 }}>
                                    <span style={{ ...styles.scoreNum, fontSize: 16 }}>{cvImprovements.atsScoreEstimate}</span>
                                    <span style={styles.scoreUnit}>%</span>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--gb-text)" }}>Score ATS estimé</div>
                                    <div style={{ fontSize: 12, color: "var(--gb-muted)" }}>
                                        {uploadedCvText ? "Basé sur votre CV uploadé" : "Basé sur votre profil"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {cvImprovements.keywordsToAdd && cvImprovements.keywordsToAdd.length > 0 && (
                        <div style={styles.section}>
                            <div style={styles.sectionTitle}><Key size={14} style={{ marginRight: 6 }} />Mots-clés à ajouter</div>
                            <div style={styles.skillsRow}>
                                {cvImprovements.keywordsToAdd.map((k, i) => (
                                    <span key={i} style={{ ...styles.skillBadge("add"), cursor: "pointer" }}
                                        onClick={() => navigator.clipboard.writeText(k)}>
                                        + {k}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {cvImprovements.suggestedSummary && (
                        <div style={styles.section}>
                            <div style={styles.sectionTitle}><Edit3 size={14} style={{ marginRight: 6 }} />Résumé adapté</div>
                            <div style={styles.suggestionBox}>{cvImprovements.suggestedSummary}</div>
                        </div>
                    )}

                    {cvImprovements.suggestedSkillsToAdd?.length > 0 && (
                        <div style={styles.section}>
                            <div style={styles.sectionTitle}><Target size={14} style={{ marginRight: 6 }} />Skills à ajouter</div>
                            <div style={styles.skillsRow}>
                                {cvImprovements.suggestedSkillsToAdd.map((s, i) => (
                                    <span key={i} style={styles.skillBadge("add")}>+ {s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {cvImprovements.sectionImprovements?.map((imp, i) => (
                        <div key={i} style={styles.section}>
                            <div style={styles.sectionTitle}><Edit3 size={14} style={{ marginRight: 6 }} />{imp.section}</div>
                            <div style={styles.improvementCard}>
                                <div style={styles.improvementLabel}>Version actuelle</div>
                                <div style={styles.currentText}>{imp.current}</div>
                                <div style={{ ...styles.improvementLabel, color: "#22c55e", marginTop: 10 }}>Version améliorée</div>
                                <div style={styles.suggestedText}>{imp.suggested}</div>
                                <div style={styles.improvementReason}>
                                    <Lightbulb size={14} style={{ marginRight: 6, verticalAlign: "text-bottom" }} />{imp.reason}
                                </div>
                            </div>
                        </div>
                    ))}

                    {cvImprovements.overallAdvice && (
                        <div style={styles.overallAdvice}>
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Conseil général</div>
                            {cvImprovements.overallAdvice}
                        </div>
                    )}

                    <div style={{ marginTop: 24, padding: 16, borderRadius: 14, background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--gb-text)", marginBottom: 6 }}>
                            <Rocket size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
                            Créer un CV adapté à cette offre
                        </div>
                        <p style={{ fontSize: 12, color: "var(--gb-muted)", marginBottom: 14 }}>
                            L'IA va générer un CV complet optimisé pour <strong style={{ color: "var(--gb-text)" }}>{offre.titre}</strong>
                            {offre.entreprise ? ` chez ${offre.entreprise}` : ""}.
                        </p>
                        {cvCreated ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10, background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.3)" }}>
                                <Check size={16} style={{ color: "#22c55e" }} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>CV créé ! Redirection...</span>
                                <Loader2 size={14} style={{ color: "#22c55e", animation: "spin 1s linear infinite", marginLeft: "auto" }} />
                            </div>
                        ) : (
                            <button
                                onClick={createTailoredCv}
                                disabled={creatingCv || parsingFile}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                    width: "100%", padding: "13px 20px", border: "none", borderRadius: 12,
                                    fontSize: 14, fontWeight: 700, cursor: creatingCv ? "not-allowed" : "pointer",
                                    fontFamily: "inherit", transition: "all 0.2s", color: "#fff",
                                    background: creatingCv ? "rgba(22,163,74,0.3)" : "linear-gradient(90deg, #16A34A, #0284C7)",
                                    boxShadow: creatingCv ? "none" : "0 4px 20px rgba(22,163,74,0.35)",
                                }}>
                                {creatingCv
                                    ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Génération en cours...</>
                                    : <><Brain size={16} /> Créer mon CV adapté</>
                                }
                            </button>
                        )}
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <button onClick={() => { setCvImprovements(null); getCvImprovements(); }} style={styles.copyBtn}>
                            <RefreshCw size={14} /> Relancer l'analyse
                        </button>
                    </div>
                </div>
            ) : (
                <div style={styles.loadingBlock}>
                    <button onClick={getCvImprovements} disabled={parsingFile} style={{ ...styles.generateBtn, cursor: parsingFile ? "not-allowed" : "pointer" }}>
                        <Brain size={14} /> {parsingFile ? "Lecture du fichier..." : "Analyser mon CV pour cette offre"}
                    </button>
                    {!uploadedCvText && (
                        <p style={{ fontSize: 11, color: "var(--gb-muted)", textAlign: "center" }}>
                            Uploadez votre CV ci-dessus pour une analyse précise,<br />ou lancez avec votre profil actuel.
                        </p>
                    )}
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}