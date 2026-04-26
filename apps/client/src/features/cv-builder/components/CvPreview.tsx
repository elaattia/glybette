import type {
    CvSection, CvTemplate,
    PersonalInfoData, ExperienceItem, EducationItem,
    SkillGroup, ProjectItem, LanguageItem, CertificationItem,
} from "../types/cv.types";
import { getTemplate } from "../templates";

interface CvPreviewProps {
    template: CvTemplate;
    sections: CvSection[];
}

export function CvPreview({ template, sections }: CvPreviewProps) {
    const tpl = getTemplate(template);
    const sorted = [...sections].sort((a, b) => a.order - b.order);

    const get = <T,>(type: string): T | null =>
        (sorted.find((s) => s.type === type)?.data as T) ?? null;

    const personal   = get<PersonalInfoData>("personal-info");
    const summary    = get<{ text: string }>("summary");
    const experience = get<ExperienceItem[]>("experience")  ?? [];
    const education  = get<EducationItem[]>("education")    ?? [];
    const skills     = get<SkillGroup[]>("skills")          ?? [];
    const projects   = get<ProjectItem[]>("projects")       ?? [];
    const languages  = get<LanguageItem[]>("languages")     ?? [];
    const certs      = get<CertificationItem[]>("certifications") ?? [];

    const accent = tpl.accentColor;
    const bg     = tpl.previewBg;

    const data = { personal, summary, experience, education, skills, projects, languages, certs, accent, bg };

    switch (template) {
        case "minimalist":   return <MinimalistTemplate {...data} />;
        case "tech":         return <TechTemplate {...data} />;
        case "academic":     return <AcademicTemplate {...data} />;
        case "creative":     return <CreativeTemplate {...data} />;
        case "classic-reinvented": return <ClassicTemplate {...data} />;
        default:             return <ModernTemplate {...data} />;
    }
}


interface TemplateProps {
    personal: PersonalInfoData | null;
    summary: { text: string } | null;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillGroup[];
    projects: ProjectItem[];
    languages: LanguageItem[];
    certs: CertificationItem[];
    accent: string;
    bg: string;
}


function EmptyState() {
    return (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#bbb", fontSize: "13px" }}>
            Remplissez le formulaire pour voir votre CV ici
        </div>
    );
}


function ModernTemplate({ personal, summary, experience, education, skills, projects, languages, certs, accent, bg }: TemplateProps) {
    const hasContent = personal || summary?.text || experience.length > 0;
    if (!hasContent) return <EmptyState />;

    return (
        <div style={{ fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif", fontSize: "9.5pt", color: "#1a1a1a", lineHeight: 1.5 }}>
            <div style={{ background: bg, color: "#fff", padding: "22px 26px" }}>
                <h1 style={{ margin: 0, fontSize: "20pt", fontWeight: 700, letterSpacing: "-0.3px", color: "#fff" }}>
                    {personal?.firstName || "Prénom"} {personal?.lastName || "Nom"}
                </h1>
                {personal?.roleTitle && (
                    <p style={{ margin: "4px 0 10px", fontSize: "10.5pt", color: accent, fontWeight: 500 }}>
                        {personal.roleTitle}
                    </p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "7.5pt", opacity: 0.85 }}>
                    {personal?.email    && <span>✉ {personal.email}</span>}
                    {personal?.phone    && <span>📱 {personal.phone}</span>}
                    {personal?.location && <span>📍 {personal.location}</span>}
                    {personal?.linkedin && <span>in {personal.linkedin}</span>}
                    {personal?.github   && <span>⌥ {personal.github}</span>}
                    {personal?.portfolio  && <span>🌐 {personal.portfolio}</span>}
                </div>
            </div>

            <div style={{ padding: "18px 26px" }}>
                {summary?.text && <ModernSection title="Profil" accent={accent}><p style={{ fontSize: "9pt", color: "#333", margin: 0 }}>{summary.text}</p></ModernSection>}

                {experience.length > 0 && (
                    <ModernSection title="Expérience" accent={accent}>
                        {experience.map((e) => (
                            <div key={e.id} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: 600, fontSize: "10pt" }}>{e.position || "Poste"}</span>
                                    <span style={{ fontSize: "8pt", color: "#666" }}>{e.startDate}{e.startDate ? " – " : ""}{e.current ? "Présent" : e.endDate}</span>
                                </div>
                                <div style={{ fontSize: "9pt", color: accent, fontWeight: 500 }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                                {e.description && <p style={{ fontSize: "8.5pt", color: "#444", margin: "3px 0 0" }}>{e.description}</p>}
                            </div>
                        ))}
                    </ModernSection>
                )}

                {education.length > 0 && (
                    <ModernSection title="Formation" accent={accent}>
                        {education.map((e) => (
                            <div key={e.id} style={{ marginBottom: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: 600, fontSize: "9.5pt" }}>{e.degree}{e.field ? ` – ${e.field}` : ""}</span>
                                    <span style={{ fontSize: "8pt", color: "#666" }}>{e.endDate || (e.current ? "Présent" : "")}</span>
                                </div>
                                <div style={{ fontSize: "9pt", color: accent }}>{e.institution}</div>
                                {e.gpa && <div style={{ fontSize: "8pt", color: "#666" }}>{e.gpa}</div>}
                            </div>
                        ))}
                    </ModernSection>
                )}

                {skills.length > 0 && (
                    <ModernSection title="Compétences" accent={accent}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {skills.map((g) => (
                                <div key={g.id} style={{ minWidth: "120px" }}>
                                    {g.category && <p style={{ fontSize: "8.5pt", fontWeight: 600, margin: "0 0 3px", color: "#333" }}>{g.category}</p>}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                                        {g.skills.map((s) => (
                                            <span key={s} style={{ background: `${accent}18`, color: "#333", padding: "1px 7px", borderRadius: "99px", fontSize: "7.5pt" }}>{s}</span>
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
                            <div key={p.id} style={{ marginBottom: "8px" }}>
                                <span style={{ fontWeight: 600, fontSize: "9.5pt" }}>{p.name}</span>
                                {p.description && <p style={{ fontSize: "8.5pt", color: "#444", margin: "2px 0" }}>{p.description}</p>}
                                {p.technologies.length > 0 && (
                                    <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                                        {p.technologies.map((t) => <span key={t} style={{ background: "#f0f4ff", color: "#333", padding: "1px 6px", borderRadius: "99px", fontSize: "7.5pt" }}>{t}</span>)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </ModernSection>
                )}

                {languages.length > 0 && (
                    <ModernSection title="Langues" accent={accent}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                            {languages.map((l) => (
                                <span key={l.id} style={{ fontSize: "9pt" }}>
                                    <strong>{l.language}</strong>
                                    <span style={{ color: "#666", fontSize: "8pt" }}> ({l.level})</span>
                                </span>
                            ))}
                        </div>
                    </ModernSection>
                )}

                {certs.length > 0 && (
                    <ModernSection title="Certifications" accent={accent}>
                        {certs.map((c) => (
                            <div key={c.id} style={{ fontSize: "9pt", marginBottom: "4px" }}>
                                <strong>{c.name}</strong>
                                <span style={{ color: "#555" }}> · {c.issuer}</span>
                                <span style={{ color: "#888", fontSize: "8pt" }}> · {c.date}</span>
                            </div>
                        ))}
                    </ModernSection>
                )}
            </div>
        </div>
    );
}

function ModernSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "15px" }}>
            <div style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: "3px", marginBottom: "8px" }}>
                {title}
            </div>
            {children}
        </div>
    );
}


function MinimalistTemplate({ personal, summary, experience, education, skills, languages, certs, accent }: TemplateProps) {
    return (
        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "9.5pt", color: "#111", lineHeight: 1.6 }}>
            <div style={{ height: "3px", background: accent, width: "100%" }} />

            <div style={{ padding: "28px 30px" }}>
                <div style={{ marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #e0e0e0" }}>
                    <h1 style={{ margin: 0, fontSize: "22pt", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: "#111" }}>
                        {personal?.firstName} {personal?.lastName}
                    </h1>
                    {personal?.roleTitle && (
                        <p style={{ margin: "6px 0 10px", fontSize: "10pt", color: "#666", fontStyle: "italic" }}>{personal.roleTitle}</p>
                    )}
                    <div style={{ display: "flex", gap: "18px", fontSize: "8pt", color: "#555", flexWrap: "wrap" }}>
                        {personal?.email    && <span>{personal.email}</span>}
                        {personal?.phone    && <span>{personal.phone}</span>}
                        {personal?.location && <span>{personal.location}</span>}
                        {personal?.linkedin && <span>{personal.linkedin}</span>}
                    </div>
                </div>

                {summary?.text && (
                    <div style={{ marginBottom: "18px" }}>
                        <p style={{ fontSize: "9.5pt", color: "#333", fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{summary.text}</p>
                    </div>
                )}

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
                        <p style={{ fontSize: "9pt", margin: 0 }}>
                            {languages.map((l) => `${l.language} (${l.level})`).join("  ·  ")}
                        </p>
                    </MinSection>
                )}
            </div>
        </div>
    );
}

function MinSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "8pt", fontWeight: 700, letterSpacing: "2px", color: accent, marginBottom: "8px" }}>{title}</div>
            {children}
        </div>
    );
}


function TechTemplate({ personal, summary, experience, education, skills, projects, languages, certs, accent, bg }: TemplateProps) {
    return (
        <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: "9pt", color: "#e2e8f0", lineHeight: 1.6, background: "#0f172a" }}>
            <div style={{ padding: "24px 28px", background: bg, borderBottom: `2px solid ${accent}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "18pt", fontWeight: 700, color: "#f8fafc", fontFamily: "'Courier New', monospace" }}>
                            {personal?.firstName} {personal?.lastName}
                        </h1>
                        {personal?.roleTitle && (
                            <p style={{ margin: "4px 0 0", fontSize: "10pt", color: accent, fontFamily: "'Courier New', monospace" }}>
                                &gt; {personal.roleTitle}
                            </p>
                        )}
                    </div>
                    <div style={{ textAlign: "right", fontSize: "7.5pt", color: "#94a3b8", fontFamily: "'Courier New', monospace" }}>
                        {personal?.email    && <div>{personal.email}</div>}
                        {personal?.phone    && <div>{personal.phone}</div>}
                        {personal?.github   && <div>{personal.github}</div>}
                        {personal?.linkedin && <div>{personal.linkedin}</div>}
                    </div>
                </div>
            </div>

            <div style={{ padding: "18px 28px" }}>
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
            </div>
        </div>
    );
}

function TechSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "8.5pt", fontWeight: 700, color: accent, fontFamily: "'Courier New', monospace", marginBottom: "8px" }}>{title}</div>
            {children}
        </div>
    );
}


function AcademicTemplate({ personal, summary, experience, education, skills, languages, certs, accent, bg }: TemplateProps) {
    return (
        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "10pt", color: "#2c1810", lineHeight: 1.65, background: "#fdf9f5" }}>
            <div style={{ height: "6px", background: `linear-gradient(90deg, ${bg}, ${accent})` }} />

            <div style={{ padding: "24px 30px" }}>
                <div style={{ textAlign: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: `2px solid ${accent}` }}>
                    <h1 style={{ margin: 0, fontSize: "22pt", fontWeight: 700, fontVariant: "small-caps", letterSpacing: "1px", color: bg }}>
                        {personal?.firstName} {personal?.lastName}
                    </h1>
                    {personal?.roleTitle && (
                        <p style={{ margin: "6px 0 10px", fontSize: "11pt", color: accent, fontStyle: "italic" }}>{personal.roleTitle}</p>
                    )}
                    <div style={{ display: "flex", justifyContent: "center", gap: "20px", fontSize: "8.5pt", color: "#6b4226", flexWrap: "wrap" }}>
                        {personal?.email    && <span>{personal.email}</span>}
                        {personal?.phone    && <span>{personal.phone}</span>}
                        {personal?.location && <span>{personal.location}</span>}
                        {personal?.linkedin && <span>{personal.linkedin}</span>}
                    </div>
                </div>

                {summary?.text && (
                    <div style={{ marginBottom: "18px", fontStyle: "italic", color: "#4a2c1a", fontSize: "9.5pt", lineHeight: 1.7 }}>
                        {summary.text}
                    </div>
                )}

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

                {skills.length > 0 && (
                    <AcadSection title="Compétences" accent={accent} bg={bg}>
                        {skills.map((g) => (
                            <div key={g.id} style={{ marginBottom: "4px", fontSize: "9.5pt" }}>
                                {g.category && <strong>{g.category} : </strong>}
                                {g.skills.join(", ")}
                            </div>
                        ))}
                    </AcadSection>
                )}

                {certs.length > 0 && (
                    <AcadSection title="Certifications & Distinctions" accent={accent} bg={bg}>
                        {certs.map((c) => (
                            <div key={c.id} style={{ fontSize: "9.5pt", marginBottom: "4px" }}>
                                <strong>{c.name}</strong> — {c.issuer} ({c.date})
                            </div>
                        ))}
                    </AcadSection>
                )}

                {languages.length > 0 && (
                    <AcadSection title="Langues" accent={accent} bg={bg}>
                        <p style={{ margin: 0, fontSize: "9.5pt" }}>
                            {languages.map((l) => `${l.language} — ${l.level}`).join("   ·   ")}
                        </p>
                    </AcadSection>
                )}
            </div>
        </div>
    );
}

function AcadSection({ title, accent, bg, children }: { title: string; accent: string; bg: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "18px" }}>
            <h2 style={{ fontSize: "11pt", fontWeight: 700, fontVariant: "small-caps", color: bg, borderBottom: `1px solid ${accent}`, paddingBottom: "4px", marginBottom: "10px" }}>
                {title}
            </h2>
            {children}
        </div>
    );
}


function CreativeTemplate({ personal, summary, experience, education, skills, projects, languages, accent, bg }: TemplateProps) {
    const sidebarBg = bg;
    const sidebarText = "#fff";

    return (
        <div style={{ display: "flex", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "9pt", lineHeight: 1.6, minHeight: "100%" }}>
            <div style={{ width: "38%", background: sidebarBg, color: sidebarText, padding: "24px 18px", flexShrink: 0 }}>
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
                    {[
                        personal?.email, personal?.phone, personal?.location,
                        personal?.linkedin, personal?.github,
                    ].filter(Boolean).map((v, i) => (
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
                        {languages.map((l) => (
                            <div key={l.id} style={{ fontSize: "8pt", color: "rgba(255,255,255,0.85)", marginBottom: "4px" }}>
                                <strong>{l.language}</strong> — {l.level}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ flex: 1, padding: "24px 20px", background: "#fff" }}>
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
            </div>
        </div>
    );
}

function CreatSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "10pt", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px", borderBottom: `1px solid ${accent}22`, paddingBottom: "4px" }}>
                {title}
            </h2>
            {children}
        </div>
    );
}


function ClassicTemplate({ personal, summary, experience, education, skills, languages, certs, accent, bg }: TemplateProps) {
    return (
        <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "9.5pt", color: "#1c2b3a", lineHeight: 1.55 }}>
            <div style={{ background: bg, color: "#fff", padding: "24px 28px" }}>
                <h1 style={{ margin: 0, fontSize: "20pt", fontWeight: 700, letterSpacing: "-0.5px", color: "#fff" }}>
                    {personal?.firstName} {personal?.lastName}
                </h1>
                {personal?.roleTitle && (
                    <p style={{ margin: "5px 0 12px", fontSize: "10pt", color: accent, fontWeight: 600 }}>{personal.roleTitle}</p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "8pt", color: "rgba(255,255,255,0.8)" }}>
                    {personal?.email    && <span> {personal.email}</span>}
                    {personal?.phone    && <span> {personal.phone}</span>}
                    {personal?.location && <span> {personal.location}</span>}
                    {personal?.linkedin && <span> {personal.linkedin}</span>}
                    {personal?.github   && <span> {personal.github}</span>}
                </div>
            </div>

            <div style={{ height: "4px", background: accent }} />

            <div style={{ padding: "18px 28px" }}>
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
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

function ClassicSection({ title, accent, bg, children }: { title: string; accent: string; bg: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "3px", height: "14px", background: accent, borderRadius: "2px" }} />
                <span style={{ fontSize: "9.5pt", fontWeight: 700, color: bg, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</span>
            </div>
            {children}
        </div>
    );
}