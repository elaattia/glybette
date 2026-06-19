import { AcadSection, type TemplateProps } from "./TemplateSection";

import { useLocale } from "@/hooks/useLocale";
import { useSectionLabels } from "../../../lib/cv-i18n";
export function AcademicTemplate({ personal, summary, experience, education, skills, projects, languages, certs, accent, bg }: TemplateProps) {
    const { t } = useLocale("cvBuilder");
    const labels = useSectionLabels(t);
    return (
        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: `calc(10pt * var(--cv-body-scale, 1))`, color: "#2c1810", lineHeight: 1.65, background: "#fdf9f5" }}>
            <div style={{ height: "6px", background: `linear-gradient(90deg, ${bg}, ${accent})` }} />
            <div style={{ padding: "15mm 30px 15mm" }}>
                <div style={{ textAlign: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: `2px solid ${accent}` }}>
                    <h1 style={{ margin: 0, fontSize: `calc(22pt * var(--cv-body-scale, 1))`, fontWeight: 700, fontVariant: "small-caps", letterSpacing: "1px", color: bg }}>
                        {personal?.firstName} {personal?.lastName}
                    </h1>
                    {personal?.roleTitle && <p style={{ margin: "6px 0 10px", fontSize: `calc(11pt * var(--cv-body-scale, 1))`, color: accent, fontStyle: "italic" }}>{personal.roleTitle}</p>}
                    <div style={{ display: "flex", justifyContent: "center", gap: "20px", fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#6b4226", flexWrap: "wrap" }}>
                        {personal?.email && <span>{personal.email}</span>}
                        {personal?.phone && <span>{personal.phone}</span>}
                        {personal?.location && <span>{personal.location}</span>}
                        {personal?.linkedin && <span>{personal.linkedin}</span>}
                    </div>
                </div>

                {summary?.text && (
                    <div style={{ marginBottom: "18px", fontStyle: "italic", color: "#4a2c1a", fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, lineHeight: 1.7 }}>
                        {summary.text}
                    </div>
                )}

                {experience.length > 0 && (
                    <AcadSection title={labels.experience} accent={accent} bg={bg}>
                        {experience.map((e) => (
                            <div key={e.id} style={{ marginBottom: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <strong style={{ fontSize: `calc(10pt * var(--cv-body-scale, 1))` }}>{e.position}</strong>
                                    <span style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#7a5c3a", fontStyle: "italic" }}>{e.startDate} – {e.current ? labels.current : e.endDate}</span>
                                </div>
                                <div style={{ fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, color: accent, fontStyle: "italic", marginBottom: "3px" }}>{e.company}{e.location ? `, ${e.location}` : ""}</div>
                                {e.description && <p style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#3d2415", margin: "3px 0 0", textAlign: "justify" }}>{e.description}</p>}
                            </div>
                        ))}
                    </AcadSection>
                )}

                {education.length > 0 && (
                    <AcadSection title={labels.education} accent={accent} bg={bg}>
                        {education.map((e) => (
                            <div key={e.id} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <strong>{e.degree}{e.field ? ` en ${e.field}` : ""}</strong>
                                    <span style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#7a5c3a", fontStyle: "italic" }}>{e.endDate}</span>
                                </div>
                                <div style={{ fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, color: accent, fontStyle: "italic" }}>{e.institution}</div>
                                {e.gpa && <div style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#6b4226" }}>{e.gpa}</div>}
                            </div>
                        ))}
                    </AcadSection>
                )}

                {projects && projects.length > 0 && (
                    <AcadSection title={labels.projects} accent={accent} bg={bg}>
                        {projects.map((p) => (
                            <div key={p.id} style={{ marginBottom: "10px" }}>
                                <strong style={{ fontSize: `calc(10pt * var(--cv-body-scale, 1))` }}>{p.name}</strong>
                                {p.description && <p style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#3d2415", margin: "3px 0 0", textAlign: "justify" }}>{p.description}</p>}
                            </div>
                        ))}
                    </AcadSection>
                )}

                {skills.length > 0 && (
                    <AcadSection title={labels.skills} accent={accent} bg={bg}>
                        {skills.map((g) => (
                            <div key={g.id} style={{ marginBottom: "4px", fontSize: `calc(9.5pt * var(--cv-body-scale, 1))` }}>
                                {g.category && <strong>{g.category} : </strong>}{g.skills.join(", ")}
                            </div>
                        ))}
                    </AcadSection>
                )}

                {certs.length > 0 && (
                    <AcadSection title={labels.certifications} accent={accent} bg={bg}>
                        {certs.map((c) => (
                            <div key={c.id} style={{ fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, marginBottom: "4px" }}>
                                <strong>{c.name}</strong> — {c.issuer} ({c.date})
                            </div>
                        ))}
                    </AcadSection>
                )}

                {languages.length > 0 && (
                    <AcadSection title={labels.languages} accent={accent} bg={bg}>
                        <p style={{ margin: 0, fontSize: `calc(9.5pt * var(--cv-body-scale, 1))` }}>
                            {languages.map((l) => `${l.language} — ${l.level}`).join("   ·   ")}
                        </p>
                    </AcadSection>
                )}
            </div>
        </div>
    );
}