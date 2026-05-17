import { MinSection, type TemplateProps } from "./TemplateSection";

export function MinimalistTemplate({ personal, summary, experience, education, skills, projects, languages, accent }: TemplateProps) {
    return (
        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "9.5pt", color: "#111", lineHeight: 1.6 }}>
            <div style={{ height: "3px", background: accent, width: "100%" }} />
            <div style={{ padding: "15mm 30px 15mm" }}>
                <div style={{ marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #e0e0e0" }}>
                    <h1 style={{ margin: 0, fontSize: "22pt", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: "#111" }}>
                        {personal?.firstName} {personal?.lastName}
                    </h1>
                    {personal?.roleTitle && <p style={{ margin: "6px 0 10px", fontSize: "10pt", color: "#666", fontStyle: "italic" }}>{personal.roleTitle}</p>}
                    <div style={{ display: "flex", gap: "18px", fontSize: "8pt", color: "#555", flexWrap: "wrap" }}>
                        {personal?.email && <span>{personal.email}</span>}
                        {personal?.phone && <span>{personal.phone}</span>}
                        {personal?.location && <span>{personal.location}</span>}
                        {personal?.linkedin && <span>{personal.linkedin}</span>}
                    </div>
                </div>

                {summary?.text && <div style={{ marginBottom: "18px" }}><p style={{ fontSize: "9.5pt", color: "#333", fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{summary.text}</p></div>}

                {experience.length > 0 && (
                    <MinSection title="EXPÉRIENCE" accent={accent}>
                        {experience.map((e) => (
                            <div key={e.id} style={{ marginBottom: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <strong style={{ fontSize: "9.5pt" }}>{e.position}</strong>
                                    <span style={{ fontSize: "8pt", color: "#777" }}>{e.startDate} – {e.current ? "Présent" : e.endDate}</span>
                                </div>
                                <div style={{ fontSize: "9pt", color: "#555", marginBottom: "3px" }}>{e.company}{e.location ? `, ${e.location}` : ""}</div>
                                {e.description && <p style={{ fontSize: "8.5pt", color: "#444", margin: 0, lineHeight: 1.55 }}>{e.description}</p>}
                            </div>
                        ))}
                    </MinSection>
                )}

                {education.length > 0 && (
                    <MinSection title="FORMATION" accent={accent}>
                        {education.map((e) => (
                            <div key={e.id} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <strong style={{ fontSize: "9.5pt" }}>{e.degree}{e.field ? ` — ${e.field}` : ""}</strong>
                                    <span style={{ fontSize: "8pt", color: "#777" }}>{e.endDate}</span>
                                </div>
                                <div style={{ fontSize: "9pt", color: "#555" }}>{e.institution}</div>
                            </div>
                        ))}
                    </MinSection>
                )}

                {projects && projects.length > 0 && (
                    <MinSection title="PROJETS" accent={accent}>
                        {projects.map((p) => (
                            <div key={p.id} style={{ marginBottom: "12px" }}>
                                <strong style={{ fontSize: "9.5pt" }}>{p.name}</strong>
                                {p.description && <p style={{ fontSize: "8.5pt", color: "#444", margin: "2px 0 0", lineHeight: 1.55 }}>{p.description}</p>}
                            </div>
                        ))}
                    </MinSection>
                )}

                {skills.length > 0 && (
                    <MinSection title="COMPÉTENCES" accent={accent}>
                        {skills.map((g) => (
                            <div key={g.id} style={{ marginBottom: "4px", fontSize: "9pt" }}>
                                {g.category && <strong>{g.category}: </strong>}
                                <span style={{ color: "#333" }}>{g.skills.join(", ")}</span>
                            </div>
                        ))}
                    </MinSection>
                )}

                {languages.length > 0 && (
                    <MinSection title="LANGUES" accent={accent}>
                        <p style={{ fontSize: "9pt", margin: 0 }}>{languages.map((l) => `${l.language} (${l.level})`).join("  ·  ")}</p>
                    </MinSection>
                )}
            </div>
        </div>
    );
}