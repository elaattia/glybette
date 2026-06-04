import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";
import { EmptyState, ModernSection, type TemplateProps } from "./TemplateSection";

export function ModernTemplate({ personal, summary, experience, education, skills, projects, languages, certs, accent, bg, photo }: TemplateProps) {
    const hasContent = personal || summary?.text || experience.length > 0;
    if (!hasContent) return <EmptyState />;

    return (
        <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, color: "#1a1a2e", lineHeight: 1.6, background: "#fff" }}>

            <div style={{ background: bg, padding: "28px 30px 24px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                    {photo && (
                        <img src={photo} alt="photo"
                            style={{ width: 76, height: 76, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.35)", flexShrink: 0 }}
                        />
                    )}
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: "0 0 3px", fontSize: `calc(22pt * var(--cv-body-scale, 1))`, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                            {personal?.firstName} {personal?.lastName}
                        </h1>
                        {personal?.roleTitle && (
                            <p style={{ margin: "0 0 12px", fontSize: `calc(10.5pt * var(--cv-body-scale, 1))`, color: accent, fontWeight: 600 }}>
                                {personal.roleTitle}
                            </p>
                        )}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: "rgba(255,255,255,0.82)", alignItems: "center" }}>
                            {personal?.email && (
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <Mail size={10} /> {personal.email}
                                </span>
                            )}
                            {personal?.phone && (
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <Phone size={10} /> {personal.phone}
                                </span>
                            )}
                            {personal?.location && (
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <MapPin size={10} /> {personal.location}
                                </span>
                            )}
                            {personal?.linkedin && (
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <Linkedin size={10} /> {personal.linkedin}
                                </span>
                            )}
                            {personal?.github && (
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <Github size={10} /> {personal.github}
                                </span>
                            )}
                            {personal?.portfolio && (
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <Globe size={10} /> {personal.portfolio}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: "22px 30px 20px" }}>
                {summary?.text && (
                    <ModernSection title="Profil" accent={accent}>
                        <p style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#444", margin: 0, lineHeight: 1.7 }}>{summary.text}</p>
                    </ModernSection>
                )}

                {experience.length > 0 && (
                    <ModernSection title="Expérience" accent={accent}>
                        {experience.map((e) => (
                            <div key={e.id} style={{ marginBottom: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px" }}>
                                    <span style={{ fontWeight: 700, fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, color: "#1a1a2e" }}>{e.position || "Poste"}</span>
                                    <span style={{ fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: "#888", whiteSpace: "nowrap" }}>
                                        {e.startDate}{e.startDate ? " – " : ""}{e.current ? "Présent" : e.endDate}
                                    </span>
                                </div>
                                <div style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: accent, fontWeight: 600, marginBottom: "3px" }}>
                                    {e.company}{e.location ? ` · ${e.location}` : ""}
                                </div>
                                {e.description && <p style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#555", margin: "3px 0 0", lineHeight: 1.6 }}>{e.description}</p>}
                            </div>
                        ))}
                    </ModernSection>
                )}

                {education.length > 0 && (
                    <ModernSection title="Formation" accent={accent}>
                        {education.map((e) => (
                            <div key={e.id} style={{ marginBottom: "9px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                                    <span style={{ fontWeight: 600, fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#1a1a2e" }}>{e.degree}{e.field ? ` – ${e.field}` : ""}</span>
                                    <span style={{ fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: "#888" }}>{e.endDate || (e.current ? "Présent" : "")}</span>
                                </div>
                                <div style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: accent }}>{e.institution}</div>
                                {e.gpa && <div style={{ fontSize: `calc(8pt * var(--cv-body-scale, 1))`, color: "#777" }}>{e.gpa}</div>}
                            </div>
                        ))}
                    </ModernSection>
                )}

                {skills.length > 0 && (
                    <ModernSection title="Compétences" accent={accent}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                            {skills.map((g) => (
                                <div key={g.id} style={{ minWidth: "120px" }}>
                                    {g.category && <p style={{ fontSize: `calc(8pt * var(--cv-body-scale, 1))`, fontWeight: 700, margin: "0 0 4px", color: "#333", textTransform: "uppercase", letterSpacing: "0.5px" }}>{g.category}</p>}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                                        {g.skills.map((s) => (
                                            <span key={s} style={{ background: `${accent}18`, color: accent, padding: "2px 8px", borderRadius: "99px", fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, fontWeight: 500 }}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ModernSection>
                )}

                {projects.length > 0 && (
                    <ModernSection title="Projets" accent={accent}>
                        {projects.map((p) => (
                            <div key={p.id} style={{ marginBottom: "9px" }}>
                                <span style={{ fontWeight: 600, fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#1a1a2e" }}>{p.name}</span>
                                {p.url && <span style={{ fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: accent, marginLeft: "6px" }}>{p.url}</span>}
                                {p.description && <p style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#555", margin: "2px 0 4px", lineHeight: 1.6 }}>{p.description}</p>}
                                {p.technologies.length > 0 && (
                                    <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                                        {p.technologies.map((t) => <span key={t} style={{ background: "#f0f4ff", color: "#4055a8", padding: "1px 7px", borderRadius: "99px", fontSize: `calc(7.5pt * var(--cv-body-scale, 1))` }}>{t}</span>)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </ModernSection>
                )}

                <div style={{ display: "grid", gridTemplateColumns: languages.length > 0 && certs.length > 0 ? "1fr 1fr" : "1fr", gap: "20px" }}>
                    {languages.length > 0 && (
                        <ModernSection title="Langues" accent={accent}>
                            {languages.map((l) => (
                                <div key={l.id} style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, marginBottom: "3px", display: "flex", justifyContent: "space-between" }}>
                                    <strong style={{ color: "#1a1a2e" }}>{l.language}</strong>
                                    <span style={{ color: "#888", fontSize: `calc(8pt * var(--cv-body-scale, 1))` }}>{l.level}</span>
                                </div>
                            ))}
                        </ModernSection>
                    )}
                    {certs.length > 0 && (
                        <ModernSection title="Certifications" accent={accent}>
                            {certs.map((c) => (
                                <div key={c.id} style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, marginBottom: "5px" }}>
                                    <strong style={{ color: "#1a1a2e" }}>{c.name}</strong>
                                    <div style={{ color: "#666", fontSize: `calc(8pt * var(--cv-body-scale, 1))` }}>{c.issuer} · {c.date}</div>
                                </div>
                            ))}
                        </ModernSection>
                    )}
                </div>
            </div>
        </div>
    );
}