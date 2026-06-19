import { Avatar, type TemplateProps } from "./TemplateSection";

export function ClassiqueTemplate({
    personal, summary, experience, education,
    skills, projects, languages, certs, accent, bg, photo,
}: TemplateProps) {
    const A = accent; // #3b82f6
    const NAVY = bg;   // #1e3a5f

    return (
        <div style={{
            fontFamily: "inherit",
            fontSize: `calc(10pt * var(--cv-body-scale, 1))`,
            color: "#1a1a1a",
            lineHeight: 1.65,
            background: "#fff",
            minHeight: "297mm",
        }}>
            <div style={{ height: "8px", background: NAVY }} />
            <div style={{ height: "3px", background: A }} />

            <div style={{ padding: "28px 36px 24px" }}>

                <div style={{
                    textAlign: "center",
                    marginBottom: "20px",
                    paddingBottom: "18px",
                    borderBottom: `2px solid ${NAVY}`,
                }}>
                    {photo && (
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                            <Avatar
                                photo={photo}
                                firstName={personal?.firstName}
                                lastName={personal?.lastName}
                                size={70}
                                accent={A}
                                bg={NAVY}
                            />
                        </div>
                    )}
                    <h1 style={{
                        margin: "0 0 4px",
                        fontSize: `calc(24pt * var(--cv-body-scale, 1))`,
                        fontWeight: 700,
                        color: NAVY,
                        fontVariant: "small-caps",
                        letterSpacing: "2px",
                        lineHeight: 1.1,
                    }}>
                        {personal?.firstName} {personal?.lastName}
                    </h1>
                    {personal?.roleTitle && (
                        <p style={{
                            margin: "0 0 14px",
                            fontSize: `calc(11pt * var(--cv-body-scale, 1))`,
                            color: A,
                            fontStyle: "italic",
                            letterSpacing: "0.5px",
                        }}>
                            {personal.roleTitle}
                        </p>
                    )}
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        gap: "0",
                        fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`,
                        color: "#555",
                    }}>
                        {[
                            personal?.email,
                            personal?.phone,
                            personal?.location,
                            personal?.linkedin,
                            personal?.github,
                            personal?.portfolio,
                        ]
                            .filter(Boolean)
                            .map((val, i, arr) => (
                                <span key={i}>
                                    {val}
                                    {i < arr.length - 1 && (
                                        <span style={{ margin: "0 10px", color: A }}>·</span>
                                    )}
                                </span>
                            ))}
                    </div>
                </div>

                {summary?.text && (
                    <ClassSection title="Résumé Professionnel" accent={A} navy={NAVY}>
                        <p style={{
                            margin: 0,
                            fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`,
                            color: "#333",
                            fontStyle: "italic",
                            lineHeight: 1.75,
                            textAlign: "justify",
                        }}>
                            {summary.text}
                        </p>
                    </ClassSection>
                )}

                {experience.length > 0 && (
                    <ClassSection title="Expérience Professionnelle" accent={A} navy={NAVY}>
                        {experience.map((e) => (
                            <div key={e.id} style={{ marginBottom: "14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                                    <strong style={{ fontSize: `calc(10pt * var(--cv-body-scale, 1))`, color: NAVY }}>{e.position}</strong>
                                    <span style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#666", fontStyle: "italic" }}>
                                        {e.startDate} – {e.current ? "Présent" : e.endDate}
                                    </span>
                                </div>
                                <div style={{ fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, color: A, fontStyle: "italic", marginBottom: "3px" }}>
                                    {e.company}{e.location ? `, ${e.location}` : ""}
                                </div>
                                {e.description && (
                                    <p style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#333", margin: "3px 0 0", textAlign: "justify", lineHeight: 1.65 }}>
                                        {e.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </ClassSection>
                )}

                {education.length > 0 && (
                    <ClassSection title="Formation Académique" accent={A} navy={NAVY}>
                        {education.map((e) => (
                            <div key={e.id} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                                    <strong style={{ fontSize: `calc(10pt * var(--cv-body-scale, 1))`, color: NAVY }}>
                                        {e.degree}{e.field ? ` en ${e.field}` : ""}
                                    </strong>
                                    <span style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#666", fontStyle: "italic" }}>{e.endDate}</span>
                                </div>
                                <div style={{ fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, color: A, fontStyle: "italic" }}>{e.institution}</div>
                                {e.gpa && <div style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#777" }}>{e.gpa}</div>}
                            </div>
                        ))}
                    </ClassSection>
                )}

                {projects.length > 0 && (
                    <ClassSection title="Projets & Réalisations" accent={A} navy={NAVY}>
                        {projects.map((p) => (
                            <div key={p.id} style={{ marginBottom: "10px" }}>
                                <strong style={{ fontSize: `calc(10pt * var(--cv-body-scale, 1))`, color: NAVY }}>{p.name}</strong>
                                {p.description && (
                                    <p style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#333", margin: "3px 0", textAlign: "justify" }}>
                                        {p.description}
                                    </p>
                                )}
                                {p.technologies.length > 0 && (
                                    <p style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#666", margin: 0 }}>
                                        <em>Technologies :</em> {p.technologies.join(", ")}
                                    </p>
                                )}
                            </div>
                        ))}
                    </ClassSection>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
                    {skills.length > 0 && (
                        <ClassSection title="Compétences" accent={A} navy={NAVY}>
                            {skills.map((g) => (
                                <div key={g.id} style={{ fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, marginBottom: "4px" }}>
                                    {g.category && <strong style={{ color: NAVY }}>{g.category} : </strong>}
                                    <span style={{ color: "#444" }}>{g.skills.join(", ")}</span>
                                </div>
                            ))}
                        </ClassSection>
                    )}

                    <div>
                        {languages.length > 0 && (
                            <ClassSection title="Langues" accent={A} navy={NAVY}>
                                <p style={{ margin: 0, fontSize: `calc(9.5pt * var(--cv-body-scale, 1))` }}>
                                    {languages.map((l) => `${l.language} — ${l.level}`).join("  ·  ")}
                                </p>
                            </ClassSection>
                        )}
                        {certs.length > 0 && (
                            <ClassSection title="Certifications" accent={A} navy={NAVY}>
                                {certs.map((c) => (
                                    <div key={c.id} style={{ fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, marginBottom: "4px" }}>
                                        <strong style={{ color: NAVY }}>{c.name}</strong> — {c.issuer} ({c.date})
                                    </div>
                                ))}
                            </ClassSection>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ height: "3px", background: A }} />
            <div style={{ height: "6px", background: NAVY }} />
        </div>
    );
}

function ClassSection({
    title, accent, navy, children,
}: {
    title: string;
    accent: string;
    navy: string;
    children: React.ReactNode;
}) {
    return (
        <div style={{ marginBottom: "18px" }}>
            <h2 style={{
                fontSize: `calc(10.5pt * var(--cv-body-scale, 1))`,
                fontWeight: 700,
                fontVariant: "small-caps",
                color: navy,
                borderBottom: `1.5px solid ${accent}55`,
                paddingBottom: "4px",
                marginBottom: "10px",
                letterSpacing: "0.5px",
            }}>
                {title}
            </h2>
            {children}
        </div>
    );
}