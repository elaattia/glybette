import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";
import type { TemplateProps } from "./TemplateSection";
import { Avatar } from "./TemplateSection";


import { useLocale } from "@/hooks/useLocale";
import { useSectionLabels } from "../../../lib/cv-i18n";
export function ElegantTemplate({
    personal, summary, experience, education,
    skills, projects, languages, certs, accent, bg, photo,
}: TemplateProps) {
    const { t } = useLocale("cvBuilder");
    const labels = useSectionLabels(t);
    const sidebarBg = bg;
    const A = accent;

    return (
        <div style={{
            display: "flex",
            fontFamily: "inherit",
            fontSize: `calc(9pt * var(--cv-body-scale, 1))`,
            color: "#1a1a2e",
            lineHeight: 1.6,
            minHeight: "297mm",
        }}>
            <div style={{
                width: "34%",
                background: sidebarBg,
                color: "#fff",
                padding: "32px 20px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: "20px",
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
                        <Avatar
                            photo={photo}
                            firstName={personal?.firstName}
                            lastName={personal?.lastName}
                            size={80}
                            accent={A}
                            bg={sidebarBg}
                        />
                    </div>
                    <h1 style={{
                        margin: 0,
                        fontSize: `calc(15pt * var(--cv-body-scale, 1))`,
                        fontWeight: 700,
                        color: "#fff",
                        lineHeight: 1.2,
                        letterSpacing: "-0.3px",
                    }}>
                        {personal?.firstName} {personal?.lastName}
                    </h1>
                    {personal?.roleTitle && (
                        <p style={{
                            margin: "6px 0 0",
                            fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`,
                            color: A,
                            fontWeight: 600,
                            letterSpacing: "0.3px",
                        }}>
                            {personal.roleTitle}
                        </p>
                    )}
                </div>

                <div style={{ height: "1px", background: "rgba(255,255,255,0.15)" }} />

                <div>
                    <SideLabel text={labels.personalInfo} accent={A} />
                    {personal?.email && (
                        <SideItem icon={<Mail size={9} />} text={personal.email} />
                    )}
                    {personal?.phone && (
                        <SideItem icon={<Phone size={9} />} text={personal.phone} />
                    )}
                    {personal?.location && (
                        <SideItem icon={<MapPin size={9} />} text={personal.location} />
                    )}
                    {personal?.linkedin && (
                        <SideItem icon={<Linkedin size={9} />} text={personal.linkedin} />
                    )}
                    {personal?.github && (
                        <SideItem icon={<Github size={9} />} text={personal.github} />
                    )}
                    {personal?.portfolio && (
                        <SideItem icon={<Globe size={9} />} text={personal.portfolio} />
                    )}
                </div>

                {skills.length > 0 && (
                    <div>
                        <SideLabel text={labels.skills} accent={A} />
                        {skills.map((g) => (
                            <div key={g.id} style={{ marginBottom: "8px" }}>
                                {g.category && (
                                    <p style={{ fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, fontWeight: 700, color: A, margin: "0 0 4px" }}>
                                        {g.category}
                                    </p>
                                )}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                                    {g.skills.map((s) => (
                                        <span key={s} style={{
                                            background: "rgba(255,255,255,0.13)",
                                            color: "rgba(255,255,255,0.9)",
                                            padding: "2px 7px",
                                            borderRadius: "99px",
                                            fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`,
                                        }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {languages.length > 0 && (
                    <div>
                        <SideLabel text={labels.languages} accent={A} />
                        {languages.map((l) => (
                            <div key={l.id} style={{ marginBottom: "5px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                                    <span style={{ fontSize: `calc(8pt * var(--cv-body-scale, 1))`, color: "#fff", fontWeight: 600 }}>{l.language}</span>
                                    <span style={{ fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: A }}>{l.level}</span>
                                </div>
                                <div style={{ height: "3px", background: "rgba(255,255,255,0.15)", borderRadius: "99px", overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%",
                                        width: levelToPercent(l.level),
                                        background: A,
                                        borderRadius: "99px",
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {certs.length > 0 && (
                    <div>
                        <SideLabel text="Certifications" accent={A} />
                        {certs.map((c) => (
                            <div key={c.id} style={{ marginBottom: "6px" }}>
                                <p style={{ margin: 0, fontSize: `calc(8pt * var(--cv-body-scale, 1))`, fontWeight: 600, color: "#fff" }}>{c.name}</p>
                                <p style={{ margin: 0, fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: A }}>{c.issuer}</p>
                                <p style={{ margin: 0, fontSize: `calc(7pt * var(--cv-body-scale, 1))`, color: "rgba(255,255,255,0.5)" }}>{c.date}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ flex: 1, padding: "32px 26px", background: "#fff" }}>

                {summary?.text && (
                    <MainSection title={labels.summary} accent={A}>
                        <p style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#444", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>
                            {summary.text}
                        </p>
                    </MainSection>
                )}

                {experience.length > 0 && (
                    <MainSection title={labels.experience} accent={A}>
                        {experience.map((e) => (
                            <div key={e.id} style={{ marginBottom: "14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                                    <span style={{ fontWeight: 700, fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, color: "#1a1a2e" }}>{e.position}</span>
                                    <span style={{ fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: "#888" }}>
                                        {e.startDate}{e.startDate ? " – " : ""}{e.current ? labels.current : e.endDate}
                                    </span>
                                </div>
                                <div style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: A, fontWeight: 600, marginBottom: "3px" }}>
                                    {e.company}{e.location ? ` · ${e.location}` : ""}
                                </div>
                                {e.description && (
                                    <p style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#555", margin: "3px 0 0", lineHeight: 1.6 }}>
                                        {e.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </MainSection>
                )}

                {education.length > 0 && (
                    <MainSection title={labels.education} accent={A}>
                        {education.map((e) => (
                            <div key={e.id} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                                    <span style={{ fontWeight: 600, fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#1a1a2e" }}>
                                        {e.degree}{e.field ? ` — ${e.field}` : ""}
                                    </span>
                                    <span style={{ fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: "#888" }}>{e.endDate}</span>
                                </div>
                                <div style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: A }}>{e.institution}</div>
                                {e.gpa && <div style={{ fontSize: `calc(8pt * var(--cv-body-scale, 1))`, color: "#777" }}>{e.gpa}</div>}
                            </div>
                        ))}
                    </MainSection>
                )}

                {projects.length > 0 && (
                    <MainSection title={labels.projects} accent={A}>
                        {projects.map((p) => (
                            <div key={p.id} style={{ marginBottom: "10px" }}>
                                <span style={{ fontWeight: 600, fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#1a1a2e" }}>{p.name}</span>
                                {p.url && <span style={{ fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: A, marginLeft: "6px" }}>{p.url}</span>}
                                {p.description && (
                                    <p style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#555", margin: "2px 0 4px", lineHeight: 1.6 }}>
                                        {p.description}
                                    </p>
                                )}
                                {p.technologies.length > 0 && (
                                    <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                                        {p.technologies.map((t) => (
                                            <span key={t} style={{
                                                background: `${A}15`,
                                                color: A,
                                                padding: "1px 7px",
                                                borderRadius: "99px",
                                                fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`,
                                            }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </MainSection>
                )}
            </div>
        </div>
    );
}


function SideLabel({ text, accent }: { text: string; accent: string }) {
    return (
        <div style={{
            fontSize: `calc(7pt * var(--cv-body-scale, 1))`,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: accent,
            marginBottom: "8px",
        }}>
            {text}
        </div>
    );
}

function SideItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "5px",
            fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`,
            color: "rgba(255,255,255,0.8)",
            wordBreak: "break-all",
        }}>
            <span style={{ flexShrink: 0, opacity: 0.7 }}>{icon}</span>
            {text}
        </div>
    );
}

function MainSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "18px" }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
            }}>
                <div style={{ width: "3px", height: "18px", background: accent, borderRadius: "2px", flexShrink: 0 }} />
                <span style={{
                    fontSize: `calc(8pt * var(--cv-body-scale, 1))`,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                    color: accent,
                }}>
                    {title}
                </span>
            </div>
            {children}
        </div>
    );
}

function levelToPercent(level: string): string {
    const map: Record<string, string> = {
        A1: "15%", A2: "30%", B1: "50%", B2: "65%", C1: "80%", C2: "95%", Native: "100%",
    };
    return map[level] ?? "60%";
}