import { CreatSection, type TemplateProps } from "./TemplateSection";

export function CreativeTemplate({ personal, summary, experience, education, skills, projects, languages, certs, accent, bg }: TemplateProps) {
    return (
        <div style={{ display: "flex", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "9pt", lineHeight: 1.6, height: "auto", minHeight: "100%" }}>
            <div style={{ width: "38%", background: bg, color: "#fff", padding: "15mm 18px", flexShrink: 0 }}>
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22pt", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>
                        {personal?.firstName?.[0]}{personal?.lastName?.[0]}
                    </div>
                    <h1 style={{ margin: 0, fontSize: "14pt", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                        {personal?.firstName}<br />{personal?.lastName}
                    </h1>
                    {personal?.roleTitle && (
                        <p style={{ margin: "6px 0 0", fontSize: "8.5pt", color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>{personal.roleTitle}</p>
                    )}
                </div>

                <div style={{ marginBottom: "18px" }}>
                    <div style={{ fontSize: "7.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.55)", marginBottom: "8px" }}>Contact</div>
                    {[personal?.email, personal?.phone, personal?.location, personal?.linkedin, personal?.github]
                        .filter(Boolean)
                        .map((v, i) => (
                            <div key={i} style={{ fontSize: "8pt", color: "rgba(255,255,255,0.85)", marginBottom: "4px", wordBreak: "break-all" }}>{v}</div>
                        ))}
                </div>

                {skills.length > 0 && (
                    <div style={{ marginBottom: "18px" }}>
                        <div style={{ fontSize: "7.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.55)", marginBottom: "8px" }}>Compétences</div>
                        {skills.map((g) => (
                            <div key={g.id} style={{ marginBottom: "8px" }}>
                                {g.category && <div style={{ fontSize: "8pt", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>{g.category}</div>}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                                    {g.skills.map((s) => (
                                        <span key={s} style={{ background: "rgba(255,255,255,0.18)", color: "#fff", padding: "2px 7px", borderRadius: "99px", fontSize: "7.5pt" }}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {languages.length > 0 && (
                    <div>
                        <div style={{ fontSize: "7.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.55)", marginBottom: "8px" }}>Langues</div>
                        {languages.map((l) => (
                            <div key={l.id} style={{ fontSize: "8pt", color: "rgba(255,255,255,0.85)", marginBottom: "4px" }}>
                                <strong>{l.language}</strong> — {l.level}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ flex: 1, padding: "15mm 20px", background: "#fff" }}>
                {summary?.text && (
                    <div style={{ marginBottom: "18px", padding: "12px 14px", background: `${accent}0d`, borderLeft: `3px solid ${accent}`, borderRadius: "0 6px 6px 0" }}>
                        <p style={{ margin: 0, fontSize: "9pt", color: "#333", fontStyle: "italic" }}>{summary.text}</p>
                    </div>
                )}

                {experience.length > 0 && (
                    <CreatSection title="Expérience" accent={accent}>
                        {experience.map((e) => (
                            <div key={e.id} style={{ marginBottom: "12px", paddingLeft: "10px", borderLeft: "2px solid #f0f0f0" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <strong style={{ fontSize: "9.5pt", color: "#111" }}>{e.position}</strong>
                                    <span style={{ fontSize: "7.5pt", color: "#888" }}>{e.startDate} – {e.current ? "Présent" : e.endDate}</span>
                                </div>
                                <div style={{ fontSize: "8.5pt", color: accent, fontWeight: 600, marginBottom: "3px" }}>{e.company}</div>
                                {e.description && <p style={{ fontSize: "8pt", color: "#555", margin: 0 }}>{e.description}</p>}
                            </div>
                        ))}
                    </CreatSection>
                )}

                {education.length > 0 && (
                    <CreatSection title="Formation" accent={accent}>
                        {education.map((e) => (
                            <div key={e.id} style={{ marginBottom: "10px" }}>
                                <strong style={{ fontSize: "9.5pt" }}>{e.degree}{e.field ? ` – ${e.field}` : ""}</strong>
                                <div style={{ fontSize: "8.5pt", color: accent }}>{e.institution}</div>
                                <div style={{ fontSize: "8pt", color: "#888" }}>{e.endDate}</div>
                            </div>
                        ))}
                    </CreatSection>
                )}

                {projects.length > 0 && (
                    <CreatSection title="Projets" accent={accent}>
                        {projects.map((p) => (
                            <div key={p.id} style={{ marginBottom: "10px" }}>
                                <strong style={{ fontSize: "9.5pt" }}>{p.name}</strong>
                                {p.description && <p style={{ fontSize: "8pt", color: "#555", margin: "2px 0" }}>{p.description}</p>}
                            </div>
                        ))}
                    </CreatSection>
                )}

                {certs && certs.length > 0 && (
                    <CreatSection title="Certifications" accent={accent}>
                        {certs.map((c) => (
                            <div key={c.id} style={{ marginBottom: "10px" }}>
                                <strong style={{ fontSize: "9.5pt" }}>{c.name}</strong>
                                <div style={{ fontSize: "8.5pt", color: accent }}>{c.issuer}</div>
                                <div style={{ fontSize: "8pt", color: "#888" }}>{c.date}</div>
                            </div>
                        ))}
                    </CreatSection>
                )}
            </div>
        </div>
    );
}