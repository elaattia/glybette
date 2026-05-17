import { TechSection, type TemplateProps } from "./TemplateSection";

export function TechTemplate({ personal, summary, experience, education, skills, projects, languages, certs, accent, bg }: TemplateProps) {
    return (
        <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: "9pt", color: "#e2e8f0", lineHeight: 1.6, background: "#0f172a", minHeight: "100%" }}>
            <div style={{ padding: "15mm 28px 24px", background: bg, borderBottom: `2px solid ${accent}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "18pt", fontWeight: 700, color: "#f8fafc", fontFamily: "'Courier New', monospace" }}>
                            {personal?.firstName} {personal?.lastName}
                        </h1>
                        {personal?.roleTitle && <p style={{ margin: "4px 0 0", fontSize: "10pt", color: accent, fontFamily: "'Courier New', monospace" }}>&gt; {personal.roleTitle}</p>}
                    </div>
                    <div style={{ textAlign: "right", fontSize: "7.5pt", color: "#94a3b8", fontFamily: "'Courier New', monospace" }}>
                        {personal?.email && <div>{personal.email}</div>}
                        {personal?.phone && <div>{personal.phone}</div>}
                        {personal?.github && <div>{personal.github}</div>}
                        {personal?.linkedin && <div>{personal.linkedin}</div>}
                    </div>
                </div>
            </div>

            <div style={{ padding: "18px 28px 15mm" }}>
                {summary?.text && (
                    <div style={{ marginBottom: "16px", padding: "10px 12px", background: "#1e293b", borderLeft: `3px solid ${accent}`, borderRadius: "0 6px 6px 0" }}>
                        <p style={{ margin: 0, fontSize: "8.5pt", color: "#cbd5e1", fontStyle: "italic" }}>{summary.text}</p>
                    </div>
                )}

                {skills.length > 0 && (
                    <TechSection title="// COMPÉTENCES" accent={accent}>
                        {skills.map((g) => (
                            <div key={g.id} style={{ marginBottom: "6px" }}>
                                {g.category && <span style={{ fontSize: "8pt", color: accent, fontFamily: "'Courier New', monospace" }}>{g.category}: </span>}
                                <span style={{ fontSize: "8pt", color: "#cbd5e1" }}>{g.skills.join(" · ")}</span>
                            </div>
                        ))}
                    </TechSection>
                )}

                {experience.length > 0 && (
                    <TechSection title="// EXPÉRIENCE" accent={accent}>
                        {experience.map((e) => (
                            <div key={e.id} style={{ marginBottom: "12px", padding: "10px 12px", background: "#1e293b", borderRadius: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <strong style={{ color: "#f1f5f9", fontSize: "9.5pt" }}>{e.position}</strong>
                                    <span style={{ fontSize: "7.5pt", color: "#64748b", fontFamily: "'Courier New', monospace" }}>{e.startDate} → {e.current ? "now" : e.endDate}</span>
                                </div>
                                <div style={{ fontSize: "8.5pt", color: accent, marginBottom: "4px" }}>{e.company}</div>
                                {e.description && <p style={{ fontSize: "8pt", color: "#94a3b8", margin: 0 }}>{e.description}</p>}
                            </div>
                        ))}
                    </TechSection>
                )}

                {projects.length > 0 && (
                    <TechSection title="// PROJETS" accent={accent}>
                        {projects.map((p) => (
                            <div key={p.id} style={{ marginBottom: "10px", padding: "10px 12px", background: "#1e293b", borderRadius: "6px" }}>
                                <strong style={{ color: "#f1f5f9", fontSize: "9.5pt" }}>{p.name}</strong>
                                {p.description && <p style={{ fontSize: "8pt", color: "#94a3b8", margin: "4px 0" }}>{p.description}</p>}
                                {p.technologies.length > 0 && (
                                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                        {p.technologies.map((t) => <span key={t} style={{ background: `${accent}20`, color: accent, padding: "1px 7px", borderRadius: "4px", fontSize: "7.5pt", fontFamily: "'Courier New', monospace" }}>{t}</span>)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </TechSection>
                )}

                {education.length > 0 && (
                    <TechSection title="// FORMATION" accent={accent}>
                        {education.map((e) => (
                            <div key={e.id} style={{ marginBottom: "8px" }}>
                                <strong style={{ color: "#f1f5f9", fontSize: "9pt" }}>{e.degree}{e.field ? ` — ${e.field}` : ""}</strong>
                                <div style={{ fontSize: "8.5pt", color: "#64748b" }}>{e.institution} · {e.endDate}</div>
                            </div>
                        ))}
                    </TechSection>
                )}

                {languages && languages.length > 0 && (
                    <TechSection title="// LANGUES" accent={accent}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {languages.map((l) => (
                                <div key={l.id} style={{ fontSize: "8.5pt" }}>
                                    <strong style={{ color: "#f1f5f9" }}>{l.language}</strong> <span style={{ color: "#64748b" }}>({l.level})</span>
                                </div>
                            ))}
                        </div>
                    </TechSection>
                )}

                {certs && certs.length > 0 && (
                    <TechSection title="// CERTIFICATIONS" accent={accent}>
                        {certs.map((c) => (
                            <div key={c.id} style={{ marginBottom: "6px" }}>
                                <strong style={{ color: "#f1f5f9", fontSize: "9pt" }}>{c.name}</strong>
                                <div style={{ fontSize: "8pt", color: "#64748b" }}>{c.issuer} · {c.date}</div>
                            </div>
                        ))}
                    </TechSection>
                )}
            </div>
        </div>
    );
}