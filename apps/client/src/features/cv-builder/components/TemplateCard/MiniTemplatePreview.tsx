import type { TemplateInfo } from "../../types/cv.types";

interface MiniTemplatePreviewProps {
    template: TemplateInfo;
}

const NAME_F = "Prénom";
const NAME_L = "NOM";
const ROLE   = "Titre du poste visé";
const EMAIL  = "email@exemple.com";
const PHONE  = "+216 00 000 000";
const LOC    = "Tunis, Tunisie";

export function MiniTemplatePreview({ template }: MiniTemplatePreviewProps) {
    const { id, accentColor: A, previewBg: BG } = template;

    switch (id) {
        case "creative":
            return (
                <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "Arial, sans-serif", fontSize: "5.5px" }}>
                    <div style={{ width: "36%", background: BG, padding: "8px 6px", color: "#fff", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${A}`, background: "rgba(255,255,255,0.18)", margin: "0 auto 3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#fff" }}>
                            PN
                        </div>
                        <div style={{ fontSize: "6.5px", fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: "1px" }}>{NAME_F} {NAME_L}</div>
                        <div style={{ fontSize: "4.5px", color: A, textAlign: "center", marginBottom: "5px" }}>{ROLE}</div>
                        <SideLabel A={A} text="Contact" />
                        {[EMAIL, PHONE, LOC].map((v, i) => (
                            <div key={i} style={{ fontSize: "4px", color: "rgba(255,255,255,0.75)", marginBottom: "2px" }}>{v}</div>
                        ))}
                        <SideLabel A={A} text="Compétences" />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
                            {["React", "TypeScript", "Node.js"].map((s) => (
                                <span key={s} style={{ background: "rgba(255,255,255,0.15)", borderRadius: "99px", padding: "1px 4px", fontSize: "3.5px", color: "rgba(255,255,255,0.85)" }}>{s}</span>
                            ))}
                        </div>
                        <SideLabel A={A} text="Langues" />
                        {[{ l: "Arabe", p: "100%" }, { l: "Français", p: "85%" }, { l: "Anglais", p: "70%" }].map((item) => (
                            <div key={item.l} style={{ marginBottom: "3px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1px" }}>
                                    <span style={{ fontSize: "3.5px", color: "#fff" }}>{item.l}</span>
                                    <span style={{ fontSize: "3.5px", color: A }}>C2</span>
                                </div>
                                <div style={{ height: "2.5px", background: "rgba(255,255,255,0.15)", borderRadius: "99px", overflow: "hidden" }}>
                                    <div style={{ width: item.p, height: "100%", background: A, borderRadius: "99px" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ flex: 1, padding: "8px 7px", background: "#fff" }}>
                        <MiniMainSection title="Profil" A={A} />
                        <MiniLines lines={[90, 78, 65]} color="#dde" />
                        <div style={{ marginTop: "5px" }} />
                        <MiniMainSection title="Expérience" A={A} />
                        {[1, 2].map((i) => (
                            <div key={i} style={{ marginBottom: "4px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <MiniBlock w={38} h={3.5} color="#1a1a2e" />
                                    <MiniBlock w={16} h={3} color="#aaa" />
                                </div>
                                <MiniBlock w={26} h={3} color={A} style={{ margin: "1px 0" }} />
                                <MiniLines lines={[80, 65]} color="#dde" />
                            </div>
                        ))}
                        <MiniMainSection title="Formation" A={A} />
                        <div>
                            <MiniBlock w={50} h={3.5} color="#1a1a2e" />
                            <MiniBlock w={32} h={3} color={A} style={{ margin: "1px 0" }} />
                        </div>
                    </div>
                </div>
            );

        case "minimalist":
            return (
                <div style={{ width: "100%", height: "100%", fontFamily: "Georgia, serif", fontSize: "5.5px", color: "#111", background: "#fff" }}>
                    <div style={{ height: "2.5px", background: A }} />
                    <div style={{ padding: "10px 12px" }}>
                        <div style={{ marginBottom: "6px", paddingBottom: "6px", borderBottom: "1px solid #e8e8e8" }}>
                            <div style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "1px", color: "#111", marginBottom: "1px" }}>
                                {NAME_F} <strong>{NAME_L}</strong>
                            </div>
                            <div style={{ fontSize: "5px", color: "#666", fontStyle: "italic", marginBottom: "3px" }}>{ROLE}</div>
                            <div style={{ display: "flex", gap: "5px", fontSize: "3.5px", color: "#888" }}>
                                <span>{EMAIL}</span><span>·</span><span>{PHONE}</span><span>·</span><span>{LOC}</span>
                            </div>
                        </div>
                        {[
                            { label: "Profil", lines: [90, 78, 68] },
                            { label: "Expérience", lines: [85, 72, 80, 65] },
                            { label: "Formation", lines: [60, 48] },
                        ].map((s) => (
                            <div key={s.label} style={{ marginBottom: "6px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
                                    <span style={{ fontSize: "4px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: A }}>{s.label}</span>
                                    <div style={{ flex: 1, height: "1px", background: "#e8e8e8" }} />
                                </div>
                                <MiniLines lines={s.lines} color="#ccc" />
                            </div>
                        ))}
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "5px" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
                                    <span style={{ fontSize: "4px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: A }}>Compétences</span>
                                    <div style={{ flex: 1, height: "1px", background: "#e8e8e8" }} />
                                </div>
                                <MiniLines lines={[55, 48, 60]} color="#ccc" />
                            </div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
                                    <span style={{ fontSize: "4px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: A }}>Langues</span>
                                    <div style={{ flex: 1, height: "1px", background: "#e8e8e8" }} />
                                </div>
                                <MiniLines lines={[50, 45, 40]} color="#ccc" />
                            </div>
                        </div>
                    </div>
                </div>
            );

        case "modern-strategy":
            return (
                <div style={{ width: "100%", height: "100%", fontFamily: "Arial, sans-serif", fontSize: "5.5px", background: "#fff" }}>
                    <div style={{ background: BG, padding: "8px 9px", display: "flex", alignItems: "center", gap: "7px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: `2px solid ${A}`, background: "rgba(255,255,255,0.2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff" }}>
                            PN
                        </div>
                        <div>
                            <div style={{ fontSize: "8px", fontWeight: 800, color: "#fff" }}>
                                {NAME_F} <span style={{ color: A }}>{NAME_L}</span>
                            </div>
                            <div style={{ fontSize: "4.5px", color: "rgba(255,255,255,0.7)", marginBottom: "3px" }}>{ROLE}</div>
                            <div style={{ display: "flex", gap: "4px", fontSize: "3.5px", color: "rgba(255,255,255,0.6)" }}>
                                <span>{EMAIL}</span><span>·</span><span>{PHONE}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ height: "2.5px", background: `linear-gradient(90deg, ${A}, ${A}80)` }} />
                    <div style={{ display: "flex" }}>
                        <div style={{ width: "36%", background: "#f8f9fa", borderRight: "1px solid #eee", padding: "6px 5px" }}>
                            <SidebarSection title="Compétences" A={A} />
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", marginBottom: "6px" }}>
                                {["React", "Node", "SQL", "Git"].map((s) => (
                                    <span key={s} style={{ background: `${A}15`, color: A, border: `1px solid ${A}35`, borderRadius: "3px", padding: "1px 4px", fontSize: "3.5px", fontWeight: 500 }}>{s}</span>
                                ))}
                            </div>
                            <SidebarSection title="Langues" A={A} />
                            {[{ l: "Arabe", p: "100%" }, { l: "Anglais", p: "70%" }].map((item) => (
                                <div key={item.l} style={{ marginBottom: "3px" }}>
                                    <div style={{ fontSize: "3.5px", color: "#333", marginBottom: "1px" }}>{item.l}</div>
                                    <div style={{ height: "3px", background: "#e0e0e0", borderRadius: "99px", overflow: "hidden" }}>
                                        <div style={{ width: item.p, height: "100%", background: A, borderRadius: "99px" }} />
                                    </div>
                                </div>
                            ))}
                            <SidebarSection title="Formation" A={A} />
                            <MiniBlock w={90} h={3.5} color="#1a1a2e" style={{ marginBottom: "1px" }} />
                            <MiniBlock w={70} h={3} color={A} style={{ marginBottom: "1px" }} />
                            <MiniBlock w={40} h={2.5} color="#888" />
                        </div>
                        <div style={{ flex: 1, padding: "6px 6px" }}>
                            <ImpactSection title="Profil" A={A} BG={BG} />
                            <MiniLines lines={[90, 75]} color="#dde" />
                            <div style={{ marginTop: "4px" }} />
                            <ImpactSection title="Expérience" A={A} BG={BG} />
                            {[1, 2].map((i) => (
                                <div key={i} style={{ marginBottom: "4px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <MiniBlock w={40} h={3.5} color="#1a1a2e" />
                                        <span style={{ fontSize: "3px", color: "#fff", background: A, borderRadius: "99px", padding: "1px 4px" }}>2022–2024</span>
                                    </div>
                                    <MiniBlock w={28} h={3} color={A} style={{ margin: "1px 0" }} />
                                    <MiniLines lines={[78]} color="#dde" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );

        case "tech":
            return (
                <div style={{ width: "100%", height: "100%", fontFamily: "'Courier New', monospace", fontSize: "5px", color: "#e2e8f0", background: "#0f172a" }}>
                    <div style={{ background: BG, borderBottom: `1.5px solid ${A}`, padding: "7px 8px", display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontSize: "8px", fontWeight: 700, color: "#f8fafc", marginBottom: "1px" }}>{NAME_F} {NAME_L}</div>
                            <div style={{ color: A, fontSize: "5px" }}>&gt; {ROLE}</div>
                        </div>
                        <div style={{ textAlign: "right", fontSize: "3.5px", color: "#64748b", lineHeight: 1.7 }}>
                            <div>{EMAIL}</div>
                            <div>{PHONE}</div>
                            <div>github.com/user</div>
                        </div>
                    </div>
                    <div style={{ padding: "5px 8px" }}>
                        <div style={{ fontSize: "4.5px", color: A, fontWeight: 700, marginBottom: "3px" }}>// COMPÉTENCES</div>
                        {["Frontend: React · Vue · TypeScript", "Backend: Node · Python · SQL"].map((row, i) => (
                            <div key={i} style={{ fontSize: "3.5px", color: "#cbd5e1", marginBottom: "2px" }}>{row}</div>
                        ))}
                        <div style={{ fontSize: "4.5px", color: A, fontWeight: 700, margin: "5px 0 3px" }}>// EXPÉRIENCE</div>
                        {[1, 2].map((i) => (
                            <div key={i} style={{ background: "#1e293b", borderRadius: "3px", padding: "3px 4px", marginBottom: "3px", borderLeft: `1.5px solid ${A}40` }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <MiniBlock w={42} h={3} color="#f1f5f9" />
                                    <MiniBlock w={18} h={2.5} color="#64748b" />
                                </div>
                                <MiniBlock w={26} h={2.5} color={A} style={{ margin: "1px 0" }} />
                                <MiniBlock w={78} h={2} color="#334155" />
                            </div>
                        ))}
                        <div style={{ fontSize: "4.5px", color: A, fontWeight: 700, margin: "4px 0 3px" }}>// PROJETS</div>
                        <div style={{ background: "#1e293b", borderRadius: "3px", padding: "3px 4px" }}>
                            <MiniBlock w={38} h={3} color="#f1f5f9" style={{ marginBottom: "1px" }} />
                            <div style={{ display: "flex", gap: "2px" }}>
                                {["React", "Node", "AWS"].map((t) => (
                                    <span key={t} style={{ background: `${A}20`, color: A, borderRadius: "3px", padding: "1px 3px", fontSize: "3px" }}>{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );

        case "classic-reinvented":
            return (
                <div style={{ width: "100%", height: "100%", fontFamily: "Georgia, serif", fontSize: "5.5px", color: "#111", background: "#fff" }}>
                    <div style={{ height: "4px", background: BG }} />
                    <div style={{ height: "2px", background: A }} />
                    <div style={{ padding: "8px 10px" }}>
                        <div style={{ textAlign: "center", marginBottom: "6px", paddingBottom: "5px", borderBottom: `1.5px solid ${BG}` }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: BG, letterSpacing: "1px", fontVariant: "small-caps", marginBottom: "1px" }}>
                                {NAME_F} {NAME_L}
                            </div>
                            <div style={{ fontSize: "5px", color: A, fontStyle: "italic", marginBottom: "3px" }}>{ROLE}</div>
                            <div style={{ display: "flex", justifyContent: "center", gap: "4px", fontSize: "3.5px", color: "#666" }}>
                                <span>{EMAIL}</span><span style={{ color: A }}>·</span>
                                <span>{PHONE}</span><span style={{ color: A }}>·</span>
                                <span>{LOC}</span>
                            </div>
                        </div>
                        {[
                            { label: "Résumé Professionnel", lines: [90, 80, 72] },
                            { label: "Expérience Professionnelle", lines: [] },
                        ].map((s) => (
                            <div key={s.label} style={{ marginBottom: "5px" }}>
                                <div style={{ fontSize: "5px", fontWeight: 700, fontVariant: "small-caps", color: BG, borderBottom: `1px solid ${A}55`, paddingBottom: "1.5px", marginBottom: "3px", letterSpacing: "0.5px" }}>
                                    {s.label}
                                </div>
                                {s.lines.length > 0 ? (
                                    <MiniLines lines={s.lines} color="#ccc" />
                                ) : (
                                    [1, 2].map((i) => (
                                        <div key={i} style={{ marginBottom: "3px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <MiniBlock w={40} h={3.5} color={BG} />
                                                <MiniBlock w={16} h={3} color="#999" />
                                            </div>
                                            <MiniBlock w={28} h={3} color={A} style={{ margin: "1px 0" }} />
                                            <MiniLines lines={[80, 65]} color="#ddd" />
                                        </div>
                                    ))
                                )}
                            </div>
                        ))}
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "5px" }}>
                            <div>
                                <div style={{ fontSize: "5px", fontWeight: 700, fontVariant: "small-caps", color: BG, borderBottom: `1px solid ${A}55`, paddingBottom: "1.5px", marginBottom: "3px" }}>Compétences</div>
                                <MiniLines lines={[55, 48, 62, 40]} color="#ddd" />
                            </div>
                            <div>
                                <div style={{ fontSize: "5px", fontWeight: 700, fontVariant: "small-caps", color: BG, borderBottom: `1px solid ${A}55`, paddingBottom: "1.5px", marginBottom: "3px" }}>Langues</div>
                                <MiniLines lines={[50, 45, 42]} color="#ddd" />
                            </div>
                        </div>
                    </div>
                    <div style={{ height: "2px", background: A }} />
                    <div style={{ height: "4px", background: BG }} />
                </div>
            );

        default:
            return <div style={{ background: "#f5f5f5", width: "100%", height: "100%" }} />;
    }
}


function MiniBlock({ w, h, color, style = {} }: { w: number; h: number; color: string; style?: React.CSSProperties }) {
    return (
        <div style={{ width: `${w}%`, height: `${h}px`, background: color, borderRadius: "1px", ...style }} />
    );
}

function MiniLines({ lines, color, style = {} }: { lines: number[]; color: string; style?: React.CSSProperties }) {
    return (
        <div style={style}>
            {lines.map((w, i) => (
                <div key={i} style={{ width: `${w}%`, height: "2.5px", background: color, borderRadius: "1px", marginBottom: "2px" }} />
            ))}
        </div>
    );
}

function SideLabel({ A, text }: { A: string; text: string }) {
    return (
        <div style={{ fontSize: "3.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: A, marginBottom: "3px" }}>
            {text}
        </div>
    );
}

function MiniMainSection({ title, A }: { title: string; A: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
            <div style={{ width: "2px", height: "9px", background: A, borderRadius: "1px", flexShrink: 0 }} />
            <div style={{ fontSize: "4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: A }}>
                {title}
            </div>
        </div>
    );
}

function SidebarSection({ title, A }: { title: string; A: string }) {
    return (
        <div style={{ fontSize: "3.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: A, borderBottom: `1.5px solid ${A}`, paddingBottom: "1.5px", marginBottom: "3px" }}>
            {title}
        </div>
    );
}

function ImpactSection({ title, A, BG }: { title: string; A: string; BG: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
            <div style={{ width: "10px", height: "2px", background: A, borderRadius: "1px" }} />
            <div style={{ fontSize: "4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: BG }}>
                {title}
            </div>
            <div style={{ flex: 1, height: "1px", background: "#eee" }} />
        </div>
    );
}