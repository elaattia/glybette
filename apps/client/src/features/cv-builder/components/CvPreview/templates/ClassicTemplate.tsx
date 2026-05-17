import { ClassicSection, type TemplateProps } from "./TemplateSection";

export function ClassicTemplate({ personal, summary, experience, education, skills, projects, languages, certs, accent, bg }: TemplateProps) {
    return (
        <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "9.5pt", color: "#1c2b3a", lineHeight: 1.55, minHeight: "100%" }}>
            <div style={{ background: bg, color: "#fff", padding: "15mm 28px 24px" }}>
                <h1 style={{ margin: 0, fontSize: "20pt", fontWeight: 700, letterSpacing: "-0.5px", color: "#fff" }}>
                    {personal?.firstName} {personal?.lastName}
                </h1>
                {personal?.roleTitle && (
                    <p style={{ margin: "5px 0 12px", fontSize: "10pt", color: accent, fontWeight: 600 }}>{personal.roleTitle}</p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "8pt", color: "rgba(255,255,255,0.8)" }}>
                    {personal?.email && <span> {personal.email}</span>}
                    {personal?.phone && <span> {personal.phone}</span>}
                    {personal?.location && <span> {personal.location}</span>}
                    {personal?.linkedin && <span> {personal.linkedin}</span>}
                    {personal?.github && <span> {personal.github}</span>}
                </div>
            </div>

            <div style={{ height: "4px", background: accent }} />

            <div style={{ padding: "18px 28px 15mm" }}>
                {summary?.text && (
                    <p style={{ fontSize: "9.5pt", color: "#2c3e50", marginBottom: "16px", fontStyle: "italic", lineHeight: 1.65 }}>{summary.text}</p>
                )}

                {experience.length > 0 && (
                    <ClassicSection title="Expérience Professionnelle" accent={accent} bg={bg}>
                        {experience.map((e) => (
                            <div key={e.id} style={{ marginBottom: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                    <strong style={{ fontSize: "10pt", color: bg }}>{e.position}</strong>
                                    <span style={{ fontSize: "8pt", color: "#7f8c8d" }}>{e.startDate} – {e.current ? "Présent" : e.endDate}</span>
                                </div>
                                <div style={{ fontSize: "9pt", color: accent, fontWeight: 600, marginBottom: "3px" }}>
                                    {e.company}{e.location ? ` · ${e.location}` : ""}
                                </div>
                                {e.description && <p style={{ fontSize: "8.5pt", color: "#444", margin: 0 }}>{e.description}</p>}
                            </div>
                        ))}
                    </ClassicSection>
                )}

                {education.length > 0 && (
                    <ClassicSection title="Formation" accent={accent} bg={bg}>
                        {education.map((e) => (
                            <div key={e.id} style={{ marginBottom: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <strong style={{ fontSize: "9.5pt", color: bg }}>{e.degree}{e.field ? ` — ${e.field}` : ""}</strong>
                                    <span style={{ fontSize: "8pt", color: "#7f8c8d" }}>{e.endDate}</span>
                                </div>
                                <div style={{ fontSize: "9pt", color: accent }}>{e.institution}</div>
                            </div>
                        ))}
                    </ClassicSection>
                )}

                {projects && projects.length > 0 && (
                    <ClassicSection title="Projets" accent={accent} bg={bg}>
                        {projects.map((p) => (
                            <div key={p.id} style={{ marginBottom: "8px" }}>
                                <strong style={{ fontSize: "9.5pt", color: bg }}>{p.name}</strong>
                                {p.description && <p style={{ fontSize: "8.5pt", color: "#444", margin: "2px 0 0" }}>{p.description}</p>}
                            </div>
                        ))}
                    </ClassicSection>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
                    {skills.length > 0 && (
                        <ClassicSection title="Compétences" accent={accent} bg={bg}>
                            {skills.map((g) => (
                                <div key={g.id} style={{ marginBottom: "5px" }}>
                                    {g.category && (
                                        <div style={{ fontSize: "8.5pt", fontWeight: 700, color: "#333", marginBottom: "3px" }}>{g.category}</div>
                                    )}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                                        {g.skills.map((s) => (
                                            <span key={s} style={{ background: `${accent}18`, color: "#1c2b3a", padding: "1px 7px", borderRadius: "99px", fontSize: "7.5pt" }}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </ClassicSection>
                    )}

                    <div>
                        {languages.length > 0 && (
                            <ClassicSection title="Langues" accent={accent} bg={bg}>
                                {languages.map((l) => (
                                    <div key={l.id} style={{ fontSize: "9pt", marginBottom: "3px" }}>
                                        <strong>{l.language}</strong> <span style={{ color: "#777" }}>({l.level})</span>
                                    </div>
                                ))}
                            </ClassicSection>
                        )}
                        {certs.length > 0 && (
                            <ClassicSection title="Certifications" accent={accent} bg={bg}>
                                {certs.map((c) => (
                                    <div key={c.id} style={{ fontSize: "8.5pt", marginBottom: "4px" }}>
                                        <strong>{c.name}</strong><br />
                                        <span style={{ color: "#666" }}>{c.issuer} · {c.date}</span>
                                    </div>
                                ))}
                            </ClassicSection>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}