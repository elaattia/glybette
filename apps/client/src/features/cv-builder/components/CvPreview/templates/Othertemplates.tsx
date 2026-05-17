import { AcadSection, CreatSection, ClassicSection, type TemplateProps } from "./TemplateSection";


export function AcademicTemplate({ personal, summary, experience, education, skills, projects, languages, certs, accent, bg }: TemplateProps) {
    return (
        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "10pt", color: "#2c1810", lineHeight: 1.65, background: "#fdf9f5" }}>
            <div style={{ height: "6px", background: `linear-gradient(90deg, ${bg}, ${accent})` }} />
            <div style={{ padding: "15mm 30px 15mm" }}>
                <div style={{ textAlign: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: `2px solid ${accent}` }}>
                    <h1 style={{ margin: 0, fontSize: "22pt", fontWeight: 700, fontVariant: "small-caps", letterSpacing: "1px", color: bg }}>
                        {personal?.firstName} {personal?.lastName}
                    </h1>
                    {personal?.roleTitle && <p style={{ margin: "6px 0 10px", fontSize: "11pt", color: accent, fontStyle: "italic" }}>{personal.roleTitle}</p>}
                    <div style={{ display: "flex", justifyContent: "center", gap: "20px", fontSize: "8.5pt", color: "#6b4226", flexWrap: "wrap" }}>
                        {personal?.email && <span>{personal.email}</span>}
                        {personal?.phone && <span>{personal.phone}</span>}
                        {personal?.location && <span>{personal.location}</span>}
                        {personal?.linkedin && <span>{personal.linkedin}</span>}
                    </div>
                </div>

                {summary?.text && <div style={{ marginBottom: "18px", fontStyle: "italic", color: "#4a2c1a", fontSize: "9.5pt", lineHeight: 1.7 }}>{summary.text}</div>}

                {experience.length > 0 && (
                    <AcadSection title="Expérience Professionnelle" accent={accent} bg={bg}>
                        {experience.map((e) => (
                            <div key={e.id} style={{ marginBottom: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <strong style={{ fontSize: "10pt" }}>{e.position}</strong>
                                    <span style={{ fontSize: "8.5pt", color: "#7a5c3a", fontStyle: "italic" }}>{e.startDate} – {e.current ? "Présent" : e.endDate}</span>
                                </div>
                                <div style={{ fontSize: "9.5pt", color: accent, fontStyle: "italic", marginBottom: "3px" }}>{e.company}{e.location ? `, ${e.location}` : ""}</div>
                                {e.description && <p style={{ fontSize: "9pt", color: "#3d2415", margin: "3px 0 0", textAlign: "justify" }}>{e.description}</p>}
                            </div>
                        ))}
                    </AcadSection>
                )}

                {education.length > 0 && (
                    <AcadSection title="Formation Académique" accent={accent} bg={bg}>
                        {education.map((e) => (
                            <div key={e.id} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <strong>{e.degree}{e.field ? ` en ${e.field}` : ""}</strong>
                                    <span style={{ fontSize: "8.5pt", color: "#7a5c3a", fontStyle: "italic" }}>{e.endDate}</span>
                                </div>
                                <div style={{ fontSize: "9.5pt", color: accent, fontStyle: "italic" }}>{e.institution}</div>
                                {e.gpa && <div style={{ fontSize: "8.5pt", color: "#6b4226" }}>{e.gpa}</div>}
                            </div>
                        ))}
                    </AcadSection>
                )}

                {projects && projects.length > 0 && (
                    <AcadSection title="Projets & Réalisations" accent={accent} bg={bg}>
                        {projects.map((p) => (
                            <div key={p.id} style={{ marginBottom: "10px" }}>
                                <strong style={{ fontSize: "10pt" }}>{p.name}</strong>
                                {p.description && <p style={{ fontSize: "9pt", color: "#3d2415", margin: "3px 0 0", textAlign: "justify" }}>{p.description}</p>}
                            </div>
                        ))}
                    </AcadSection>
                )}

                {skills.length > 0 && (
                    <AcadSection title="Compétences" accent={accent} bg={bg}>
                        {skills.map((g) => (
                            <div key={g.id} style={{ marginBottom: "4px", fontSize: "9.5pt" }}>
                                {g.category && <strong>{g.category} : </strong>}{g.skills.join(", ")}
                            </div>
                        ))}
                    </AcadSection>
                )}

                {certs.length > 0 && (
                    <AcadSection title="Certifications & Distinctions" accent={accent} bg={bg}>
                        {certs.map((c) => <div key={c.id} style={{ fontSize: "9.5pt", marginBottom: "4px" }}><strong>{c.name}</strong> — {c.issuer} ({c.date})</div>)}
                    </AcadSection>
                )}

                {languages.length > 0 && (
                    <AcadSection title="Langues" accent={accent} bg={bg}>
                        <p style={{ margin: 0, fontSize: "9.5pt" }}>{languages.map((l) => `${l.language} — ${l.level}`).join("   ·   ")}</p>
                    </AcadSection>
                )}
            </div>
        </div>
    );
}


export function CreativeTemplate({ personal, summary, experience, education, skills, projects, languages, certs, accent, bg }: TemplateProps) {
    return (
        <div style={{ display: "flex", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "9pt", lineHeight: 1.6, height: "auto", minHeight: "100%" }}>
=            <div style={{ width: "38%", background: bg, color: "#fff", padding: "15mm 18px", flexShrink: 0 }}>
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22pt", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>
                        {personal?.firstName?.[0]}{personal?.lastName?.[0]}
                    </div>
                    <h1 style={{ margin: 0, fontSize: "14pt", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{personal?.firstName}<br />{personal?.lastName}</h1>
                    {personal?.roleTitle && <p style={{ margin: "6px 0 0", fontSize: "8.5pt", color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>{personal.roleTitle}</p>}
                </div>

                <div style={{ marginBottom: "18px" }}>
                    <div style={{ fontSize: "7.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.55)", marginBottom: "8px" }}>Contact</div>
                    {[personal?.email, personal?.phone, personal?.location, personal?.linkedin, personal?.github].filter(Boolean).map((v, i) => (
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
                                    {g.skills.map((s) => <span key={s} style={{ background: "rgba(255,255,255,0.18)", color: "#fff", padding: "2px 7px", borderRadius: "99px", fontSize: "7.5pt" }}>{s}</span>)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {languages.length > 0 && (
                    <div>
                        <div style={{ fontSize: "7.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.55)", marginBottom: "8px" }}>Langues</div>
                        {languages.map((l) => <div key={l.id} style={{ fontSize: "8pt", color: "rgba(255,255,255,0.85)", marginBottom: "4px" }}><strong>{l.language}</strong> — {l.level}</div>)}
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


export function ClassicTemplate({ personal, summary, experience, education, skills, projects, languages, certs, accent, bg }: TemplateProps) {
    return (
        <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "9.5pt", color: "#1c2b3a", lineHeight: 1.55, minHeight: "100%" }}>
            <div style={{ background: bg, color: "#fff", padding: "15mm 28px 24px" }}>
                <h1 style={{ margin: 0, fontSize: "20pt", fontWeight: 700, letterSpacing: "-0.5px", color: "#fff" }}>{personal?.firstName} {personal?.lastName}</h1>
                {personal?.roleTitle && <p style={{ margin: "5px 0 12px", fontSize: "10pt", color: accent, fontWeight: 600 }}>{personal.roleTitle}</p>}
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
                {summary?.text && <p style={{ fontSize: "9.5pt", color: "#2c3e50", marginBottom: "16px", fontStyle: "italic", lineHeight: 1.65 }}>{summary.text}</p>}

                {experience.length > 0 && (
                    <ClassicSection title="Expérience Professionnelle" accent={accent} bg={bg}>
                        {experience.map((e) => (
                            <div key={e.id} style={{ marginBottom: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                    <strong style={{ fontSize: "10pt", color: bg }}>{e.position}</strong>
                                    <span style={{ fontSize: "8pt", color: "#7f8c8d" }}>{e.startDate} – {e.current ? "Présent" : e.endDate}</span>
                                </div>
                                <div style={{ fontSize: "9pt", color: accent, fontWeight: 600, marginBottom: "3px" }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
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
                                    {g.category && <div style={{ fontSize: "8.5pt", fontWeight: 700, color: "#333", marginBottom: "3px" }}>{g.category}</div>}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                                        {g.skills.map((s) => <span key={s} style={{ background: `${accent}18`, color: "#1c2b3a", padding: "1px 7px", borderRadius: "99px", fontSize: "7.5pt" }}>{s}</span>)}
                                    </div>
                                </div>
                            ))}
                        </ClassicSection>
                    )}
                    <div>
                        {languages.length > 0 && (
                            <ClassicSection title="Langues" accent={accent} bg={bg}>
                                {languages.map((l) => <div key={l.id} style={{ fontSize: "9pt", marginBottom: "3px" }}><strong>{l.language}</strong> <span style={{ color: "#777" }}>({l.level})</span></div>)}
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