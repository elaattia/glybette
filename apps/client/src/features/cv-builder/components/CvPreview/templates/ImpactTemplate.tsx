import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";
import type { TemplateProps } from "./TemplateSection";
import { Avatar } from "./TemplateSection";

import { useLocale } from "@/hooks/useLocale";
import { useSectionLabels } from "../../../lib/cv-i18n";
export function ImpactTemplate({
    personal, summary, experience, education,
    skills, projects, languages, certs, accent, bg, photo,
}: TemplateProps) {
    const { t } = useLocale("cvBuilder");
    const labels = useSectionLabels(t);
    const A = accent; // #f97316

    return (
        <div style={{
            fontFamily: "inherit",
            fontSize: `calc(9pt * var(--cv-body-scale, 1))`,
            color: "#1a1a2e",
            lineHeight: 1.6,
            background: "#fff",
            minHeight: "297mm",
        }}>
            <div style={{
                background: bg,
                padding: "28px 32px",
                display: "flex",
                alignItems: "center",
                gap: "22px",
            }}>
                <div style={{ flexShrink: 0 }}>
                    <Avatar
                        photo={photo}
                        firstName={personal?.firstName}
                        lastName={personal?.lastName}
                        size={90}
                        accent={A}
                        bg={bg}
                    />
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{
                        margin: "0 0 2px",
                        fontSize: `calc(22pt * var(--cv-body-scale, 1))`,
                        fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "-0.5px",
                        lineHeight: 1.1,
                    }}>
                        {personal?.firstName}{" "}
                        <span style={{ color: A }}>{personal?.lastName}</span>
                    </h1>
                    {personal?.roleTitle && (
                        <p style={{ margin: "0 0 12px", fontSize: `calc(10pt * var(--cv-body-scale, 1))`, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
                            {personal.roleTitle}
                        </p>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: "rgba(255,255,255,0.7)" }}>
                        {personal?.email && <ContactItem icon={<Mail size={9} />} text={personal.email} />}
                        {personal?.phone && <ContactItem icon={<Phone size={9} />} text={personal.phone} />}
                        {personal?.location && <ContactItem icon={<MapPin size={9} />} text={personal.location} />}
                        {personal?.linkedin && <ContactItem icon={<Linkedin size={9} />} text={personal.linkedin} />}
                        {personal?.github && <ContactItem icon={<Github size={9} />} text={personal.github} />}
                        {personal?.portfolio && <ContactItem icon={<Globe size={9} />} text={personal.portfolio} />}
                    </div>
                </div>
            </div>

            <div style={{ height: "4px", background: `linear-gradient(90deg, ${A}, ${A}80)` }} />

            <div style={{ display: "flex" }}>

                <div style={{
                    width: "35%",
                    background: "#f8f9fa",
                    borderRight: "1px solid #eee",
                    padding: "22px 18px",
                    flexShrink: 0,
                }}>
                    {skills.length > 0 && (
                        <SideSection title={labels.skills} accent={A}>
                            {skills.map((g) => (
                                <div key={g.id} style={{ marginBottom: "8px" }}>
                                    {g.category && (
                                        <p style={{ fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, fontWeight: 700, color: "#333", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            {g.category}
                                        </p>
                                    )}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                                        {g.skills.map((s) => (
                                            <span key={s} style={{
                                                background: `${A}15`,
                                                color: A,
                                                border: `1px solid ${A}35`,
                                                padding: "2px 7px",
                                                borderRadius: "4px",
                                                fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`,
                                                fontWeight: 500,
                                            }}>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </SideSection>
                    )}

                    {languages.length > 0 && (
                        <SideSection title={labels.languages} accent={A}>
                            {languages.map((l) => (
                                <div key={l.id} style={{ marginBottom: "6px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                                        <span style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, fontWeight: 600, color: "#222" }}>{l.language}</span>
                                        <span style={{ fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: A, fontWeight: 600 }}>{l.level}</span>
                                    </div>
                                    <div style={{ height: "4px", background: "#e0e0e0", borderRadius: "99px", overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: levelToPercent(l.level), background: A, borderRadius: "99px" }} />
                                    </div>
                                </div>
                            ))}
                        </SideSection>
                    )}

                    {education.length > 0 && (
                        <SideSection title={labels.education} accent={A}>
                            {education.map((e) => (
                                <div key={e.id} style={{ marginBottom: "9px" }}>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#1a1a2e" }}>
                                        {e.degree}{e.field ? ` — ${e.field}` : ""}
                                    </p>
                                    <p style={{ margin: "1px 0", fontSize: `calc(8pt * var(--cv-body-scale, 1))`, color: A }}>{e.institution}</p>
                                    <p style={{ margin: 0, fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: "#888" }}>{e.endDate}</p>
                                </div>
                            ))}
                        </SideSection>
                    )}

                    {certs.length > 0 && (
                        <SideSection title={labels.certifications} accent={A}>
                            {certs.map((c) => (
                                <div key={c.id} style={{ marginBottom: "7px" }}>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#222" }}>{c.name}</p>
                                    <p style={{ margin: 0, fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, color: A }}>{c.issuer} · {c.date}</p>
                                </div>
                            ))}
                        </SideSection>
                    )}
                </div>

                <div style={{ flex: 1, padding: "22px 22px" }}>

                    {summary?.text && (
                        <MainSection title={labels.summary} accent={A} bg={bg}>
                            <p style={{ fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#444", margin: 0, lineHeight: 1.7 }}>
                                {summary.text}
                            </p>
                        </MainSection>
                    )}

                    {experience.length > 0 && (
                        <MainSection title={labels.experience} accent={A} bg={bg}>
                            {experience.map((e, i) => (
                                <div key={e.id} style={{
                                    marginBottom: "14px",
                                    paddingBottom: i < experience.length - 1 ? "14px" : 0,
                                    borderBottom: i < experience.length - 1 ? "1px dashed #eee" : "none",
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                                        <span style={{ fontWeight: 700, fontSize: `calc(9.5pt * var(--cv-body-scale, 1))`, color: "#1a1a2e" }}>{e.position}</span>
                                        <span style={{
                                            fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`,
                                            color: "#fff",
                                            background: A,
                                            borderRadius: "99px",
                                            padding: "1px 8px",
                                            fontWeight: 600,
                                        }}>
                                            {e.startDate} – {e.current ? labels.current : e.endDate}
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

                    {projects.length > 0 && (
                        <MainSection title={labels.projects} accent={A} bg={bg}>
                            {projects.map((p) => (
                                <div key={p.id} style={{ marginBottom: "10px" }}>
                                    <span style={{ fontWeight: 700, fontSize: `calc(9pt * var(--cv-body-scale, 1))`, color: "#1a1a2e" }}>{p.name}</span>
                                    {p.description && (
                                        <p style={{ fontSize: `calc(8.5pt * var(--cv-body-scale, 1))`, color: "#555", margin: "2px 0 4px", lineHeight: 1.6 }}>
                                            {p.description}
                                        </p>
                                    )}
                                    {p.technologies.length > 0 && (
                                        <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                                            {p.technologies.map((t) => (
                                                <span key={t} style={{
                                                    background: "#f0f4ff",
                                                    color: "#4055a8",
                                                    padding: "1px 7px",
                                                    borderRadius: "4px",
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
        </div>
    );
}

function ContactItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {icon} {text}
        </span>
    );
}

function SideSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "18px" }}>
            <div style={{
                fontSize: `calc(7pt * var(--cv-body-scale, 1))`,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: accent,
                borderBottom: `2px solid ${accent}`,
                paddingBottom: "4px",
                marginBottom: "10px",
            }}>
                {title}
            </div>
            {children}
        </div>
    );
}

function MainSection({ title, accent, bg, children }: { title: string; accent: string; bg: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "18px" }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
            }}>
                <div style={{ width: "14px", height: "3px", background: accent, borderRadius: "2px" }} />
                <span style={{
                    fontSize: `calc(8pt * var(--cv-body-scale, 1))`,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: bg,
                }}>
                    {title}
                </span>
                <div style={{ flex: 1, height: "1px", background: "#eee" }} />
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