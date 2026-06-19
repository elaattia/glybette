import type { TemplateProps } from "./TemplateSection";

export function MinimalistTemplate({
    personal, summary, experience, education,
    skills, projects, languages, certs, accent,
}: TemplateProps) {
    const A = accent;

    return (
        <div style={{
            fontFamily: "inherit",
            fontSize: `calc(10pt * var(--cv-body-scale, 1))`,
            color: "#1a1a1a",
            lineHeight: 1.65,
            background: "#fff",
            minHeight: "297mm",
        }}>
            <div style={{ height: "3px", background: A }} />

            <div style={{ padding: "32px 40px 28px" }}>

                <div style={{ marginBottom: "22px", paddingBottom: "18px", borderBottom: "1px solid #e8e8e8" }}>
                    <h1 style={{
                        margin: "0 0 4px",
                        fontSize: `calc(26pt * var(--cv-body-scale, 1))`,
                        fontWeight: 400,
                        letterSpacing: "1px",
                        color: "#111",
                        lineHeight: 1.1,
                    }}>
                        {personal?.firstName} <strong style={{ fontWeight: 700 }}>{personal?.lastName}</strong>
                    </h1>
                    {personal?.roleTitle && (
                        <p style={{ margin: "0 0 12px", fontSize: `calc(10.5pt * var(--cv-body-scale, 1))`, color: "#666", fontStyle: "italic" }}>
                            {personal.roleTitle}
                        </p>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: `calc(8pt * var(--cv-body-scale, 1))`, color: "#666" }}>
                        {personal?.email && <span>{personal.email}</span>}
                        {personal?.phone && <span>{personal.phone}</span>}
                        {personal?.location && <span>{personal.location}</span>}
                        {personal?.linkedin && <span>{personal.linkedin}</span>}
                        {personal?.github && <span>{personal.github}</span>}
                        {personal?.portfolio && <span>{personal.portfolio}</span>}
                    </div>
                </div>

                {summary?.text && (
                    <MinSection title="Profil" accent={A}>
                        <p style={{ margin: 0, fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, color: "#333", fontStyle: "italic", lineHeight: 1.75 }}>
                            {summary.text}
                        </p>
                    </MinSection>
                )}

                {experience.length > 0 && (
                    <MinSection title="Expérience" accent={A}>
                        {experience.map((e) => (
                            <div key={e.id} style={{ marginBottom: "14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                                    <span style={{ fontWeight: 700, fontSize: `calc(10pt * var(--cv-body-scale, 1))` }}>{e.position}</span>
                                    <span style={{ fontSize: `calc(8pt * var(--cv-body-scale, 1))`, color: "#888", fontStyle: "italic" }}>
                                        {e.startDate}{e.startDate ? " – " : ""}{e.current ? "Présent" : e.endDate}
                                    </span>
                                </div>
                                <div style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#555", marginBottom: "3px" }}>
                                    {e.company}{e.location ? `, ${e.location}` : ""}
                                </div>
                                {e.description && (
                                    <p style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#444", margin: "3px 0 0", lineHeight: 1.6 }}>
                                        {e.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </MinSection>
                )}

                {education.length > 0 && (
                    <MinSection title="Formation" accent={A}>
                        {education.map((e) => (
                            <div key={e.id} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                                    <span style={{ fontWeight: 700, fontSize: `calc(10pt * var(--cv-body-scale, 1))` }}>
                                        {e.degree}{e.field ? ` — ${e.field}` : ""}
                                    </span>
                                    <span style={{ fontSize: `calc(8pt * var(--cv-body-scale, 1))`, color: "#888", fontStyle: "italic" }}>{e.endDate}</span>
                                </div>
                                <div style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#555" }}>{e.institution}</div>
                                {e.gpa && <div style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#777" }}>{e.gpa}</div>}
                            </div>
                        ))}
                    </MinSection>
                )}

                {(skills.length > 0 || languages.length > 0 || certs.length > 0) && (
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
                        {skills.length > 0 && (
                            <MinSection title="Compétences" accent={A}>
                                {skills.map((g) => (
                                    <div key={g.id} style={{ marginBottom: "5px", fontSize: `calc(9pt * var(--cv-body-scale, 1))` }}>
                                        {g.category && (
                                            <span style={{ fontWeight: 700, color: "#333" }}>{g.category}: </span>
                                        )}
                                        <span style={{ color: "#555" }}>{g.skills.join(", ")}</span>
                                    </div>
                                ))}
                            </MinSection>
                        )}

                        <div>
                            {languages.length > 0 && (
                                <MinSection title="Langues" accent={A}>
                                    {languages.map((l) => (
                                        <div key={l.id} style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, marginBottom: "3px" }}>
                                            <strong>{l.language}</strong>{" "}
                                            <span style={{ color: "#777" }}>({l.level})</span>
                                        </div>
                                    ))}
                                </MinSection>
                            )}
                            {certs.length > 0 && (
                                <MinSection title="Certifications" accent={A}>
                                    {certs.map((c) => (
                                        <div key={c.id} style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, marginBottom: "5px" }}>
                                            <div style={{ fontWeight: 700 }}>{c.name}</div>
                                            <div style={{ color: "#666" }}>{c.issuer} · {c.date}</div>
                                        </div>
                                    ))}
                                </MinSection>
                            )}
                        </div>
                    </div>
                )}

                {projects.length > 0 && (
                    <MinSection title="Projets" accent={A}>
                        {projects.map((p) => (
                            <div key={p.id} style={{ marginBottom: "12px" }}>
                                <span style={{ fontWeight: 700, fontSize: `calc(10pt * var(--cv-body-scale, 1))` }}>{p.name}</span>
                                {p.description && (
                                    <p style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#444", margin: "2px 0 4px", lineHeight: 1.6 }}>
                                        {p.description}
                                    </p>
                                )}
                                {p.technologies.length > 0 && (
                                    <p style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#777", margin: 0 }}>
                                        {p.technologies.join(", ")}
                                    </p>
                                )}
                            </div>
                        ))}
                    </MinSection>
                )}
            </div>
        </div>
    );
}

function MinSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "18px" }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
            }}>
                <span style={{
                    fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`,
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: accent,
                }}>
                    {title}
                </span>
                <div style={{ flex: 1, height: "1px", background: "#e8e8e8" }} />
            </div>
            {children}
        </div>
    );
}