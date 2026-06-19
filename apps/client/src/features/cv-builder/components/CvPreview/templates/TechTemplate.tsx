import type { TemplateProps } from "./TemplateSection";

export function TechTemplate({
    personal, summary, experience, education,
    skills, projects, languages, certs, accent, bg,
}: TemplateProps) {
    const A = accent; // #38bdf8

    return (
        <div style={{
            fontFamily: "inherit",
            fontSize: `calc(9pt * var(--cv-body-scale, 1))`,
            color: "#e2e8f0",
            lineHeight: 1.6,
            background: "#0f172a",
            minHeight: "297mm",
        }}>
            <div style={{
                background: bg,
                borderBottom: `2px solid ${A}`,
                padding: "24px 28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
            }}>
                <div>
                    <h1 style={{
                        margin: "0 0 2px",
                        fontSize: `calc(20pt * var(--cv-body-scale, 1))`,
                        fontWeight: 700,
                        color: "#f8fafc",
                        fontFamily: "'Courier New', Courier, monospace",
                        letterSpacing: "-0.5px",
                    }}>
                        {personal?.firstName} {personal?.lastName}
                    </h1>
                    {personal?.roleTitle && (
                        <p style={{
                            margin: "0 0 10px",
                            fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`,
                            color: A,
                            fontFamily: "'Courier New', Courier, monospace",
                        }}>
                            &gt; {personal.roleTitle}
                        </p>
                    )}
                </div>
                <div style={{
                    textAlign: "right",
                    fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`,
                    color: "#64748b",
                    fontFamily: "'Courier New', Courier, monospace",
                    lineHeight: 1.8,
                }}>
                    {personal?.email && <div>{personal.email}</div>}
                    {personal?.phone && <div>{personal.phone}</div>}
                    {personal?.location && <div>{personal.location}</div>}
                    {personal?.github && <div>{personal.github}</div>}
                    {personal?.linkedin && <div>{personal.linkedin}</div>}
                    {personal?.portfolio && <div>{personal.portfolio}</div>}
                </div>
            </div>

            <div style={{ padding: "20px 28px 24px", display: "flex", flexDirection: "column", gap: "0" }}>

                {summary?.text && (
                    <TechSection title="/* PROFIL */" accent={A}>
                        <div style={{
                            background: "#1e293b",
                            borderLeft: `3px solid ${A}`,
                            borderRadius: "0 6px 6px 0",
                            padding: "10px 14px",
                        }}>
                            <p style={{ margin: 0, fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#cbd5e1", fontStyle: "italic", lineHeight: 1.7 }}>
                                {summary.text}
                            </p>
                        </div>
                    </TechSection>
                )}

                {skills.length > 0 && (
                    <TechSection title="// COMPÉTENCES" accent={A}>
                        {skills.map((g) => (
                            <div key={g.id} style={{ marginBottom: "7px" }}>
                                {g.category && (
                                    <span style={{
                                        fontSize: `calc(8pt * var(--cv-body-scale, 1))`,
                                        color: A,
                                        fontFamily: "'Courier New', Courier, monospace",
                                        marginRight: "6px",
                                    }}>
                                        {g.category}:
                                    </span>
                                )}
                                <span style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#cbd5e1" }}>
                                    {g.skills.join(" · ")}
                                </span>
                            </div>
                        ))}
                    </TechSection>
                )}

                {experience.length > 0 && (
                    <TechSection title="// EXPÉRIENCE" accent={A}>
                        {experience.map((e) => (
                            <div key={e.id} style={{
                                background: "#1e293b",
                                borderRadius: "8px",
                                padding: "12px 14px",
                                marginBottom: "8px",
                                borderLeft: `2px solid ${A}40`,
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                                    <strong style={{ color: "#f1f5f9", fontSize: `calc(9.5pt * var(--cv-body-scale, 1))` }}>{e.position}</strong>
                                    <span style={{
                                        fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`,
                                        color: "#64748b",
                                        fontFamily: "'Courier New', Courier, monospace",
                                    }}>
                                        {e.startDate} → {e.current ? "now" : e.endDate}
                                    </span>
                                </div>
                                <div style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: A, marginBottom: "4px", fontWeight: 600 }}>
                                    {e.company}{e.location ? ` · ${e.location}` : ""}
                                </div>
                                {e.description && (
                                    <p style={{ fontSize: `calc(8pt * var(--cv-body-scale, 1))`, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
                                        {e.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </TechSection>
                )}

                {projects.length > 0 && (
                    <TechSection title="// PROJETS" accent={A}>
                        {projects.map((p) => (
                            <div key={p.id} style={{
                                background: "#1e293b",
                                borderRadius: "8px",
                                padding: "10px 14px",
                                marginBottom: "8px",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                                    <strong style={{ color: "#f1f5f9", fontSize: `calc(9.5pt * var(--cv-body-scale, 1))` }}>{p.name}</strong>
                                    {p.url && (
                                        <span style={{ fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: A }}>↗ {p.url}</span>
                                    )}
                                </div>
                                {p.description && (
                                    <p style={{ fontSize: `calc(8pt * var(--cv-body-scale, 1))`, color: "#94a3b8", margin: "0 0 5px", lineHeight: 1.6 }}>
                                        {p.description}
                                    </p>
                                )}
                                {p.technologies.length > 0 && (
                                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                        {p.technologies.map((t) => (
                                            <span key={t} style={{
                                                background: `${A}20`,
                                                color: A,
                                                padding: "1px 7px",
                                                borderRadius: "4px",
                                                fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`,
                                                fontFamily: "'Courier New', Courier, monospace",
                                            }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </TechSection>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {education.length > 0 && (
                        <TechSection title="// FORMATION" accent={A}>
                            {education.map((e) => (
                                <div key={e.id} style={{ marginBottom: "8px" }}>
                                    <strong style={{ color: "#f1f5f9", fontSize: `calc(9pt * var(--cv-body-scale, 1))` }}>
                                        {e.degree}{e.field ? ` — ${e.field}` : ""}
                                    </strong>
                                    <div style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#64748b" }}>
                                        {e.institution} · {e.endDate}
                                    </div>
                                    {e.gpa && <div style={{ fontSize: `calc(8pt * var(--cv-body-scale, 1))`, color: A }}>{e.gpa}</div>}
                                </div>
                            ))}
                        </TechSection>
                    )}

                    <div>
                        {languages.length > 0 && (
                            <TechSection title="// LANGUES" accent={A}>
                                {languages.map((l) => (
                                    <div key={l.id} style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, marginBottom: "3px" }}>
                                        <strong style={{ color: "#f1f5f9" }}>{l.language}</strong>{" "}
                                        <span style={{ color: "#64748b" }}>({l.level})</span>
                                    </div>
                                ))}
                            </TechSection>
                        )}
                        {certs.length > 0 && (
                            <TechSection title="// CERTIFICATIONS" accent={A}>
                                {certs.map((c) => (
                                    <div key={c.id} style={{ marginBottom: "6px" }}>
                                        <strong style={{ color: "#f1f5f9", fontSize: `calc(9pt * var(--cv-body-scale, 1))` }}>{c.name}</strong>
                                        <div style={{ fontSize: `calc(8pt * var(--cv-body-scale, 1))`, color: "#64748b" }}>{c.issuer} · {c.date}</div>
                                    </div>
                                ))}
                            </TechSection>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TechSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "18px" }}>
            <div style={{
                fontSize: `calc(8pt * var(--cv-body-scale, 1))`,
                fontWeight: 700,
                color: accent,
                fontFamily: "'Courier New', Courier, monospace",
                marginBottom: "8px",
                letterSpacing: "0.5px",
            }}>
                {title}
            </div>
            {children}
        </div>
    );
}