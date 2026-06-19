import type { CvSection } from "../../types/cv.types";

interface MiniCvPreviewProps {
    templateId: string;
    accent: string;
    bg: string;
    firstName: string;
    lastName: string;
    roleTitle: string;
    sections: Array<{ type: string; data: unknown }>;
}

export function MiniCvPreview({ templateId, accent, bg, firstName, lastName, roleTitle, sections }: MiniCvPreviewProps) {
    const A = accent;
    const BG = bg;

    const personal = (sections.find((s) => s.type === "personal-info")?.data ?? {}) as Record<string, string>;
    const summary   = (sections.find((s) => s.type === "summary")?.data ?? {}) as { text?: string };
    const exp       = (sections.find((s) => s.type === "experience")?.data ?? []) as Array<{ position?: string; company?: string; description?: string }>;
    const edu       = (sections.find((s) => s.type === "education")?.data ?? []) as Array<{ degree?: string; institution?: string }>;
    const skills    = (sections.find((s) => s.type === "skills")?.data ?? []) as Array<{ category?: string; skills?: string[] }>;

    const name  = [firstName, lastName].filter(Boolean).join(" ") || "Votre Nom";
    const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
    const email = personal.email || "";
    const loc   = personal.location || "";

    if (templateId === "elegant") {
        return (
            <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "Arial, sans-serif", fontSize: "5.5px" }}>
                <div style={{ width: "35%", background: BG, padding: "7px 5px", color: "#fff" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", border: `2px solid ${A}`, background: "rgba(255,255,255,0.18)", margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: 700 }}>
                        {initials}
                    </div>
                    <div style={{ fontSize: "5.5px", fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: "1px" }}>{name}</div>
                    <div style={{ fontSize: "4px", color: A, textAlign: "center", marginBottom: "5px" }}>{roleTitle}</div>
                    {email && <div style={{ fontSize: "3.5px", color: "rgba(255,255,255,0.7)", marginBottom: "1.5px" }}>{email}</div>}
                    {loc && <div style={{ fontSize: "3.5px", color: "rgba(255,255,255,0.7)", marginBottom: "5px" }}>{loc}</div>}
                    {skills.slice(0, 3).map((g, i) => (
                        <div key={i} style={{ marginBottom: "3px" }}>
                            {(g.skills ?? []).slice(0, 2).map((s) => (
                                <span key={s} style={{ background: "rgba(255,255,255,0.15)", borderRadius: "99px", padding: "1px 4px", fontSize: "3.5px", color: "rgba(255,255,255,0.85)", marginRight: "2px", display: "inline-block", marginBottom: "1px" }}>{s}</span>
                            ))}
                        </div>
                    ))}
                </div>
                <div style={{ flex: 1, padding: "7px 6px", background: "#fff" }}>
                    {summary?.text && (
                        <div style={{ marginBottom: "4px" }}>
                            <SectionBar title="Profil" A={A} />
                            <MiniPara text={summary.text} color="#444" />
                        </div>
                    )}
                    <SectionBar title="Expérience" A={A} />
                    {exp.slice(0, 2).map((e, i) => (
                        <div key={i} style={{ marginBottom: "3px", paddingLeft: "4px", borderLeft: `1.5px solid ${A}30` }}>
                            <MiniRow color="#111" text={e.position || ""} bold />
                            <MiniRow color={A} text={e.company || ""} />
                        </div>
                    ))}
                    <SectionBar title="Formation" A={A} />
                    {edu.slice(0, 1).map((e, i) => (
                        <div key={i}>
                            <MiniRow color="#111" text={e.degree || ""} bold />
                            <MiniRow color={A} text={e.institution || ""} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (templateId === "minimalist") {
        return (
            <div style={{ width: "100%", height: "100%", fontFamily: "Georgia, serif", fontSize: "5.5px", color: "#111", background: "#fff" }}>
                <div style={{ height: "2.5px", background: A }} />
                <div style={{ padding: "9px 10px" }}>
                    <div style={{ marginBottom: "5px", paddingBottom: "4px", borderBottom: "1px solid #e8e8e8" }}>
                        <div style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "1px", color: "#111", marginBottom: "1px" }}>
                            {firstName} <strong>{lastName}</strong>
                        </div>
                        <div style={{ fontSize: "5px", color: "#666", fontStyle: "italic", marginBottom: "2px" }}>{roleTitle}</div>
                        <div style={{ fontSize: "3.5px", color: "#888" }}>{email}{loc ? ` · ${loc}` : ""}</div>
                    </div>
                    {summary?.text && <MiniPara text={summary.text} color="#555" />}
                    {exp.slice(0, 2).map((e, i) => (
                        <div key={i} style={{ marginBottom: "3px" }}>
                            <MiniRow color="#111" text={e.position || ""} bold />
                            <MiniRow color="#666" text={e.company || ""} />
                        </div>
                    ))}
                    {edu.slice(0, 1).map((e, i) => (
                        <div key={i} style={{ marginBottom: "3px" }}>
                            <MiniRow color="#111" text={e.degree || ""} bold />
                            <MiniRow color="#666" text={e.institution || ""} />
                        </div>
                    ))}
                    {skills.length > 0 && (
                        <div style={{ marginTop: "3px" }}>
                            {skills.flatMap((g) => g.skills ?? []).slice(0, 5).map((s, i) => (
                                <span key={i} style={{ fontSize: "3.5px", color: "#555", marginRight: "3px" }}>{s}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (templateId === "impact") {
        return (
            <div style={{ width: "100%", height: "100%", fontFamily: "Arial, sans-serif", fontSize: "5.5px", background: "#fff" }}>
                <div style={{ background: BG, padding: "7px 8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: `2px solid ${A}`, background: "rgba(255,255,255,0.2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "#fff" }}>
                        {initials}
                    </div>
                    <div>
                        <div style={{ fontSize: "7px", fontWeight: 800, color: "#fff" }}>
                            {firstName} <span style={{ color: A }}>{lastName}</span>
                        </div>
                        <div style={{ fontSize: "4px", color: "rgba(255,255,255,0.7)" }}>{roleTitle}</div>
                        <div style={{ fontSize: "3.5px", color: "rgba(255,255,255,0.55)", marginTop: "1px" }}>{email}</div>
                    </div>
                </div>
                <div style={{ height: "2px", background: A }} />
                <div style={{ display: "flex" }}>
                    <div style={{ width: "35%", background: "#f8f9fa", borderRight: "1px solid #eee", padding: "5px 4px" }}>
                        <div style={{ fontSize: "3.5px", fontWeight: 700, color: A, borderBottom: `1px solid ${A}`, paddingBottom: "1px", marginBottom: "3px", textTransform: "uppercase" }}>Compétences</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", marginBottom: "4px" }}>
                            {skills.flatMap((g) => g.skills ?? []).slice(0, 4).map((s, i) => (
                                <span key={i} style={{ background: `${A}15`, color: A, borderRadius: "3px", padding: "1px 3px", fontSize: "3px" }}>{s}</span>
                            ))}
                        </div>
                        <div style={{ fontSize: "3.5px", fontWeight: 700, color: A, borderBottom: `1px solid ${A}`, paddingBottom: "1px", marginBottom: "3px", textTransform: "uppercase" }}>Formation</div>
                        {edu.slice(0, 1).map((e, i) => (
                            <div key={i}>
                                <div style={{ fontSize: "4px", fontWeight: 700, color: "#1a1a2e" }}>{e.degree}</div>
                                <div style={{ fontSize: "3.5px", color: A }}>{e.institution}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ flex: 1, padding: "5px 5px" }}>
                        {summary?.text && <MiniPara text={summary.text} color="#444" />}
                        {exp.slice(0, 2).map((e, i) => (
                            <div key={i} style={{ marginBottom: "3px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <MiniRow color="#111" text={e.position || ""} bold />
                                    <span style={{ fontSize: "3px", color: "#fff", background: A, borderRadius: "99px", padding: "1px 3px" }}>2024</span>
                                </div>
                                <MiniRow color={A} text={e.company || ""} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (templateId === "tech") {
        return (
            <div style={{ width: "100%", height: "100%", fontFamily: "monospace", fontSize: "5px", color: "#e2e8f0", background: "#0f172a" }}>
                <div style={{ background: BG, borderBottom: `1.5px solid ${A}`, padding: "6px 7px" }}>
                    <div style={{ fontSize: "8px", fontWeight: 700, color: "#f8fafc", marginBottom: "1px" }}>{name}</div>
                    <div style={{ color: A, fontSize: "5px" }}>&gt; {roleTitle}</div>
                </div>
                <div style={{ padding: "4px 7px" }}>
                    <div style={{ fontSize: "4px", color: A, fontWeight: 700, marginBottom: "2px" }}>// COMPÉTENCES</div>
                    {skills.slice(0, 2).map((g, i) => (
                        <div key={i} style={{ fontSize: "3.5px", color: "#cbd5e1", marginBottom: "1.5px" }}>
                            {g.category ? <span style={{ color: A }}>{g.category}: </span> : null}
                            {(g.skills ?? []).slice(0, 4).join(" · ")}
                        </div>
                    ))}
                    <div style={{ fontSize: "4px", color: A, fontWeight: 700, margin: "3px 0 2px" }}>// EXPÉRIENCE</div>
                    {exp.slice(0, 2).map((e, i) => (
                        <div key={i} style={{ background: "#1e293b", borderRadius: "3px", padding: "2px 3px", marginBottom: "2px" }}>
                            <MiniRow color="#f1f5f9" text={e.position || ""} />
                            <MiniRow color={A} text={e.company || ""} />
                        </div>
                    ))}
                    <div style={{ fontSize: "4px", color: A, fontWeight: 700, margin: "3px 0 2px" }}>// FORMATION</div>
                    {edu.slice(0, 1).map((e, i) => (
                        <div key={i}>
                            <MiniRow color="#f1f5f9" text={e.degree || ""} />
                            <MiniRow color="#64748b" text={e.institution || ""} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (templateId === "classique") {
        return (
            <div style={{ width: "100%", height: "100%", fontFamily: "Georgia, serif", fontSize: "5.5px", color: "#1a1a1a", background: "#fff" }}>
                <div style={{ height: "4px", background: BG }} />
                <div style={{ height: "2px", background: A }} />
                <div style={{ padding: "7px 9px" }}>
                    <div style={{ textAlign: "center", paddingBottom: "5px", marginBottom: "5px", borderBottom: `1.5px solid ${BG}` }}>
                        <div style={{ fontSize: "9px", fontWeight: 700, color: BG, letterSpacing: "0.8px", fontVariant: "small-caps", marginBottom: "1px" }}>{name}</div>
                        <div style={{ fontSize: "5px", color: A, fontStyle: "italic", marginBottom: "2px" }}>{roleTitle}</div>
                        <div style={{ fontSize: "3.5px", color: "#666" }}>{email}{loc ? ` · ${loc}` : ""}</div>
                    </div>
                    {summary?.text && <MiniPara text={summary.text} color="#444" />}
                    {exp.slice(0, 2).map((e, i) => (
                        <div key={i} style={{ marginBottom: "3px" }}>
                            <MiniRow color={BG} text={e.position || ""} bold />
                            <MiniRow color={A} text={e.company || ""} />
                        </div>
                    ))}
                    {edu.slice(0, 1).map((e, i) => (
                        <div key={i}>
                            <MiniRow color={BG} text={e.degree || ""} bold />
                            <MiniRow color={A} text={e.institution || ""} />
                        </div>
                    ))}
                </div>
                <div style={{ height: "2px", background: A }} />
                <div style={{ height: "4px", background: BG }} />
            </div>
        );
    }

    return (
        <div style={{ width: "100%", height: "100%", fontFamily: "Arial, sans-serif", fontSize: "5.5px", color: "#1a1a1a", background: "#fff" }}>
            <div style={{ background: BG, padding: "8px 8px 7px", color: "#fff" }}>
                <div style={{ fontSize: "8px", fontWeight: 800, color: "#fff", marginBottom: "1px" }}>{name}</div>
                <div style={{ fontSize: "5.5px", color: A, fontWeight: 600, marginBottom: "3px" }}>{roleTitle}</div>
            </div>
            <div style={{ padding: "5px 8px" }}>
                {exp.slice(0, 2).map((e, i) => (
                    <div key={i} style={{ marginBottom: "3px" }}>
                        <MiniRow color="#111" text={e.position || ""} bold />
                        <MiniRow color={A} text={e.company || ""} />
                    </div>
                ))}
            </div>
        </div>
    );
}


function SectionBar({ title, A }: { title: string; A: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "2px" }}>
            <div style={{ width: "2px", height: "8px", background: A, borderRadius: "1px", flexShrink: 0 }} />
            <div style={{ fontSize: "4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: A }}>
                {title}
            </div>
        </div>
    );
}

function MiniRow({ color, text, bold }: { color: string; text: string; bold?: boolean }) {
    return (
        <div style={{
            fontSize: "4.5px",
            color,
            fontWeight: bold ? 700 : 400,
            marginBottom: "1px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
        }}>
            {text}
        </div>
    );
}

function MiniPara({ text, color }: { text: string; color: string }) {
    return (
        <div style={{
            fontSize: "4px",
            color,
            lineHeight: 1.4,
            marginBottom: "3px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: "3",
            WebkitBoxOrient: "vertical" as const,
        }}>
            {text}
        </div>
    );
}