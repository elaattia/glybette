import { useState } from "react";
import { Edit3, Download, Trash2, Clock, Target, MoreVertical, Copy, Share2, Loader } from "lucide-react";
import type { CvDTO } from "../types/cv.types";
import { getTemplate } from "../templates";

interface CvCardProps {
    cv: CvDTO;
    onEdit: (cv: CvDTO) => void;
    onDelete: (id: string) => void;
    onExportPdf: (id: string) => void;
    onDuplicate: (id: string) => void;
    isExporting: boolean;
    isDeleting: boolean;
    isDuplicating: boolean;
}

export function CvCard({
    cv,
    onEdit,
    onDelete,
    onExportPdf,
    onDuplicate,
    isExporting,
    isDeleting,
    isDuplicating,
}: CvCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const tpl = getTemplate(cv.template);

    const atsColor =
        cv.atsScore == null ? null : cv.atsScore >= 80 ? "#16A34A" : cv.atsScore >= 60 ? "#ca8a04" : "#dc2626";

    const timeAgo = formatRelative(new Date(cv.updatedAt));
    const isBusy = isDeleting || isDuplicating;

    const sections = cv.sections ?? [];
    const personal = (sections.find((s) => s.type === "personal-info")?.data ?? {}) as Record<string, string>;
    const firstName = personal.firstName || "Prénom";
    const lastName = personal.lastName || "Nom";
    const roleTitle = personal.roleTitle || "Titre du poste";

    return (
        <div
            onClick={() => !menuOpen && onEdit(cv)}
            style={{
                background: "var(--gb-app-panel-bg)",
                border: "1px solid var(--gb-border)",
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
                opacity: isBusy ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
                if (!isBusy) {
                    e.currentTarget.style.borderColor = tpl.accentColor + "80";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 8px 32px ${tpl.accentColor}18`;
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--gb-border)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
            }}>
            <div
                style={{
                    height: "180px",
                    background: "#f0f2f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px",
                    position: "relative",
                    overflow: "hidden",
                }}>
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        background: "#fff",
                        borderRadius: "3px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)",
                        overflow: "hidden",
                        position: "relative",
                    }}>
                    <MiniCvPreview
                        templateId={cv.template}
                        accent={tpl.accentColor}
                        bg={tpl.previewBg}
                        firstName={firstName}
                        lastName={lastName}
                        roleTitle={roleTitle}
                        sections={sections}
                    />
                </div>

                {cv.atsScore != null && (
                    <div
                        style={{
                            position: "absolute",
                            top: "14px",
                            right: "14px",
                            background: atsColor!,
                            color: "#fff",
                            fontSize: "9px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "99px",
                            boxShadow: `0 2px 6px ${atsColor}50`,
                        }}>
                        ATS {cv.atsScore}%
                    </div>
                )}

                {cv.isPublic && (
                    <div
                        style={{
                            position: "absolute",
                            top: "14px",
                            left: "14px",
                            background: "rgba(22,163,74,0.85)",
                            backdropFilter: "blur(4px)",
                            color: "#fff",
                            fontSize: "9px",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "99px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                        }}>
                        <Share2 style={{ width: 9, height: 9 }} /> Public
                    </div>
                )}

                <div
                    style={{
                        position: "absolute",
                        bottom: "14px",
                        left: "14px",
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(6px)",
                        color: "#fff",
                        fontSize: "9px",
                        fontWeight: 500,
                        padding: "2px 8px",
                        borderRadius: "99px",
                    }}>
                    {tpl.name}
                </div>
            </div>

            <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                            style={{
                                margin: "0 0 5px",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "var(--gb-text)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}>
                            {cv.title}
                        </h3>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                color: "var(--gb-muted)",
                                fontSize: "11.5px",
                            }}>
                            <Clock style={{ width: 11, height: 11 }} />
                            {timeAgo}
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(!menuOpen);
                        }}
                        style={{
                            background: "transparent",
                            border: "1px solid var(--gb-border)",
                            borderRadius: "7px",
                            padding: "4px 6px",
                            cursor: "pointer",
                            color: "var(--gb-muted)",
                            flexShrink: 0,
                            display: "flex",
                        }}>
                        <MoreVertical style={{ width: 14, height: 14 }} />
                    </button>
                </div>

                {cv.atsScore != null && (
                    <div style={{ marginTop: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                            <span
                                style={{
                                    fontSize: "11px",
                                    color: "var(--gb-muted)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                }}>
                                <Target style={{ width: 10, height: 10 }} /> ATS Score
                            </span>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: atsColor! }}>
                                {cv.atsScore}/100
                            </span>
                        </div>
                        <div style={{ height: "4px", background: "var(--gb-app-hover)", borderRadius: "99px" }}>
                            <div
                                style={{
                                    height: "100%",
                                    width: `${cv.atsScore}%`,
                                    background: atsColor!,
                                    borderRadius: "99px",
                                    transition: "width 0.6s ease",
                                }}
                            />
                        </div>
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "12px",
                        borderTop: "1px solid var(--gb-border)",
                        paddingTop: "12px",
                    }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(cv);
                        }}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            background: "linear-gradient(90deg, #16A34A, #0284C7)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "9px",
                            padding: "7px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}>
                        <Edit3 style={{ width: 12, height: 12 }} /> Modifier
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onExportPdf(cv._id);
                        }}
                        disabled={isExporting}
                        title="Exporter PDF"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                            background: "var(--gb-app-hover)",
                            border: "1px solid var(--gb-border)",
                            borderRadius: "9px",
                            padding: "7px 11px",
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "var(--gb-text-off)",
                            cursor: isExporting ? "wait" : "pointer",
                            flexShrink: 0,
                        }}>
                        {isExporting ? (
                            <Loader style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
                        ) : (
                            <Download style={{ width: 12, height: 12 }} />
                        )}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <>
                    <div
                        style={{ position: "fixed", inset: 0, zIndex: 10 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: "14px",
                            right: "14px",
                            zIndex: 20,
                            background: "var(--gb-app-panel-bg)",
                            border: "1px solid var(--gb-border)",
                            borderRadius: "12px",
                            padding: "5px",
                            minWidth: "160px",
                            boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
                        }}>
                        <MenuItem
                            icon={<Edit3 style={{ width: 13, height: 13 }} />}
                            label="Modifier"
                            onClick={() => {
                                setMenuOpen(false);
                                onEdit(cv);
                            }}
                        />
                        <MenuItem
                            icon={<Copy style={{ width: 13, height: 13 }} />}
                            label="Dupliquer"
                            onClick={() => {
                                setMenuOpen(false);
                                onDuplicate(cv._id);
                            }}
                        />
                        <MenuItem
                            icon={<Download style={{ width: 13, height: 13 }} />}
                            label="Exporter PDF"
                            onClick={() => {
                                setMenuOpen(false);
                                onExportPdf(cv._id);
                            }}
                        />
                        <div style={{ height: "1px", background: "var(--gb-border)", margin: "3px 0" }} />
                        <MenuItem
                            icon={<Trash2 style={{ width: 13, height: 13 }} />}
                            label="Supprimer"
                            danger
                            onClick={() => {
                                setMenuOpen(false);
                                onDelete(cv._id);
                            }}
                        />
                    </div>
                </>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

interface MiniCvPreviewProps {
    templateId: string;
    accent: string;
    bg: string;
    firstName: string;
    lastName: string;
    roleTitle: string;
    sections: Array<{ type: string; data: unknown }>;
}

function MiniCvPreview({ templateId, accent, bg, firstName, lastName, roleTitle, sections }: MiniCvPreviewProps) {
    const personal = (sections.find((s) => s.type === "personal-info")?.data ?? {}) as Record<string, string>;
    const summary = (sections.find((s) => s.type === "summary")?.data ?? {}) as { text?: string };
    const exp = (sections.find((s) => s.type === "experience")?.data ?? []) as Array<{
        position?: string;
        company?: string;
        description?: string;
    }>;
    const edu = (sections.find((s) => s.type === "education")?.data ?? []) as Array<{
        degree?: string;
        institution?: string;
    }>;
    const skills = (sections.find((s) => s.type === "skills")?.data ?? []) as Array<{
        category?: string;
        skills?: string[];
    }>;

    const name = [firstName, lastName].filter(Boolean).join(" ") || "Votre Nom";
    const email = personal.email || "";
    const phone = personal.phone || "";
    const loc = personal.location || "";

    if (templateId === "tech") {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: "#0f172a",
                    fontFamily: "monospace",
                    fontSize: "5.5px",
                    color: "#e2e8f0",
                }}>
                <div style={{ background: bg, borderBottom: `1.5px solid ${accent}`, padding: "7px 8px" }}>
                    <div style={{ fontSize: "8px", fontWeight: 700, color: "#f8fafc", marginBottom: "1px" }}>
                        {name}
                    </div>
                    <div style={{ color: accent, fontSize: "5.5px", marginBottom: "3px" }}>&gt; {roleTitle}</div>
                    <div style={{ display: "flex", gap: "5px", fontSize: "4px", color: "#64748b" }}>
                        {email && <span>{email}</span>}
                        {phone && <span>· {phone}</span>}
                    </div>
                </div>
                <div style={{ padding: "5px 8px" }}>
                    <MiniLabel color={accent} text="// SKILLS" />
                    {skills.slice(0, 2).map((g, i) => (
                        <div key={i} style={{ display: "flex", gap: "3px", marginBottom: "2px" }}>
                            {g.category && <span style={{ color: accent, fontSize: "4.5px" }}>{g.category}:</span>}
                            <span style={{ fontSize: "4.5px", color: "#94a3b8" }}>
                                {(g.skills ?? []).slice(0, 4).join(" · ")}
                            </span>
                        </div>
                    ))}
                    <div style={{ marginTop: "4px" }}>
                        <MiniLabel color={accent} text="// EXPÉRIENCE" />
                        {exp.slice(0, 2).map((e, i) => (
                            <div
                                key={i}
                                style={{
                                    background: "#1e293b",
                                    borderRadius: "3px",
                                    padding: "3px 4px",
                                    marginBottom: "2px",
                                }}>
                                <MiniRow color="#f1f5f9" text={e.position || "Poste"} />
                                <MiniRow color={accent} text={e.company || ""} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (templateId === "design-epure") {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: bg,
                    display: "flex",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "5.5px",
                    color: "#e2e8f0",
                }}>
                <div style={{ width: "4px", background: accent, flexShrink: 0 }} />
                <div style={{ flex: 1, padding: "8px 7px" }}>
                    <div style={{ marginBottom: "7px" }}>
                        <div
                            style={{
                                fontSize: "9px",
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.92)",
                                marginBottom: "2px",
                            }}>
                            {name}
                        </div>
                        <div style={{ fontSize: "5.5px", color: accent, marginBottom: "3px" }}>{roleTitle}</div>
                        <div style={{ height: "1px", background: `${accent}40`, marginBottom: "3px" }} />
                        <div style={{ fontSize: "4px", color: "rgba(255,255,255,0.45)" }}>
                            {email}
                            {loc ? ` · ${loc}` : ""}
                        </div>
                    </div>
                    {summary?.text && <MiniPara text={summary.text} color="rgba(255,255,255,0.6)" />}
                    {exp.slice(0, 2).map((e, i) => (
                        <div key={i} style={{ marginBottom: "4px" }}>
                            <MiniRow color="rgba(255,255,255,0.85)" text={e.position || ""} />
                            <MiniRow color={accent} text={e.company || ""} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (templateId === "creative" || templateId === "skills-focus") {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "5.5px",
                }}>
                <div style={{ width: "40%", background: bg, padding: "8px 6px", color: "#fff" }}>
                    <div
                        style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: `${accent}80`,
                            border: "2px solid rgba(255,255,255,0.3)",
                            margin: "0 auto 4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                        <div style={{ fontSize: "9px", fontWeight: 700, color: "#fff" }}>
                            {firstName.charAt(0)}
                            {lastName.charAt(0)}
                        </div>
                    </div>
                    <div
                        style={{
                            textAlign: "center",
                            fontSize: "5.5px",
                            fontWeight: 700,
                            color: "#fff",
                            marginBottom: "1px",
                        }}>
                        {name}
                    </div>
                    <div
                        style={{
                            textAlign: "center",
                            fontSize: "4px",
                            color: "rgba(255,255,255,0.65)",
                            marginBottom: "6px",
                        }}>
                        {roleTitle}
                    </div>
                    {email && (
                        <div style={{ fontSize: "4px", color: "rgba(255,255,255,0.7)", marginBottom: "2px" }}>
                            {email}
                        </div>
                    )}
                    {loc && (
                        <div style={{ fontSize: "4px", color: "rgba(255,255,255,0.7)", marginBottom: "5px" }}>
                            {loc}
                        </div>
                    )}
                    {skills.slice(0, 4).map((g, i) => (
                        <div key={i} style={{ marginBottom: "3px" }}>
                            {g.category && (
                                <div style={{ fontSize: "4px", color: "rgba(255,255,255,0.55)", marginBottom: "1px" }}>
                                    {g.category}
                                </div>
                            )}
                            <div
                                style={{
                                    height: "3px",
                                    background: "rgba(255,255,255,0.15)",
                                    borderRadius: "99px",
                                    overflow: "hidden",
                                }}>
                                <div
                                    style={{
                                        width: "75%",
                                        height: "100%",
                                        background: "rgba(255,255,255,0.65)",
                                        borderRadius: "99px",
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ flex: 1, padding: "8px 6px", background: "#fff" }}>
                    {summary?.text && (
                        <div
                            style={{
                                background: `${accent}10`,
                                borderLeft: `2px solid ${accent}`,
                                padding: "3px 4px",
                                marginBottom: "5px",
                                borderRadius: "0 3px 3px 0",
                            }}>
                            <MiniPara text={summary.text} color="#555" />
                        </div>
                    )}
                    <MiniLabel color={accent} text="Expérience" />
                    {exp.slice(0, 2).map((e, i) => (
                        <div
                            key={i}
                            style={{ marginBottom: "4px", paddingLeft: "4px", borderLeft: "1.5px solid #f0f0f0" }}>
                            <MiniRow color="#111" text={e.position || ""} />
                            <MiniRow color={accent} text={e.company || ""} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (templateId === "minimalist") {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: "#fff",
                    fontFamily: "Helvetica, sans-serif",
                    fontSize: "5.5px",
                    color: "#111",
                }}>
                <div style={{ height: "2.5px", background: accent }} />
                <div style={{ padding: "10px 10px" }}>
                    <div
                        style={{
                            fontSize: "10px",
                            fontWeight: 300,
                            letterSpacing: "3px",
                            textTransform: "uppercase",
                            marginBottom: "1px",
                        }}>
                        {name}
                    </div>
                    <div style={{ fontSize: "5px", color: "#888", fontStyle: "italic", marginBottom: "4px" }}>
                        {roleTitle}
                    </div>
                    <div style={{ height: "1px", background: "#ebebeb", marginBottom: "4px" }} />
                    <div style={{ fontSize: "4px", color: "#aaa", marginBottom: "6px" }}>
                        {[email, phone, loc].filter(Boolean).join(" · ")}
                    </div>
                    {summary?.text && <MiniPara text={summary.text} color="#555" />}
                    {exp.slice(0, 2).map((e, i) => (
                        <div key={i} style={{ marginBottom: "4px" }}>
                            <MiniRow color="#111" text={e.position || ""} bold />
                            <MiniRow color="#888" text={e.company || ""} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (templateId === "academic") {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: "#fdf9f5",
                    fontFamily: "Georgia, serif",
                    fontSize: "5.5px",
                    color: "#2c1810",
                }}>
                <div style={{ height: "3px", background: `linear-gradient(90deg,${bg},${accent})` }} />
                <div style={{ padding: "7px 9px" }}>
                    <div
                        style={{
                            textAlign: "center",
                            paddingBottom: "5px",
                            marginBottom: "5px",
                            borderBottom: `1px solid ${accent}55`,
                        }}>
                        <div style={{ fontSize: "9px", fontWeight: 700, color: bg, marginBottom: "1px" }}>{name}</div>
                        <div style={{ fontSize: "5px", color: accent, fontStyle: "italic", marginBottom: "2px" }}>
                            {roleTitle}
                        </div>
                        <div style={{ fontSize: "4px", color: "#6b4226" }}>
                            {[email, loc].filter(Boolean).join(" · ")}
                        </div>
                    </div>
                    {exp.slice(0, 2).map((e, i) => (
                        <div key={i} style={{ marginBottom: "4px" }}>
                            <MiniRow color="#333" text={e.position || ""} bold />
                            <MiniRow color={accent} text={e.company || ""} />
                        </div>
                    ))}
                    {edu.slice(0, 1).map((e, i) => (
                        <div key={i} style={{ marginBottom: "4px" }}>
                            <MiniRow color="#333" text={`${e.degree || ""} — ${e.institution || ""}`} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (templateId === "classic-reinvented") {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: "#fff",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "5.5px",
                    color: "#1c2b3a",
                }}>
                <div style={{ background: bg, padding: "7px 8px" }}>
                    <div style={{ fontSize: "8.5px", fontWeight: 700, color: "#fff", marginBottom: "1px" }}>{name}</div>
                    <div style={{ fontSize: "5.5px", color: accent, fontWeight: 600, marginBottom: "2px" }}>
                        {roleTitle}
                    </div>
                    <div style={{ fontSize: "4px", color: "rgba(255,255,255,0.7)" }}>
                        {[email, phone].filter(Boolean).join(" · ")}
                    </div>
                </div>
                <div style={{ height: "2px", background: accent }} />
                <div style={{ padding: "5px 8px" }}>
                    {summary?.text && <MiniPara text={summary.text} color="#888" />}
                    {exp.slice(0, 2).map((e, i) => (
                        <div key={i} style={{ marginBottom: "4px" }}>
                            <MiniRow color={bg} text={e.position || ""} bold />
                            <MiniRow color={accent} text={e.company || ""} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                fontFamily: "Arial, sans-serif",
                fontSize: "5.5px",
                color: "#1a1a1a",
                background: "#fff",
            }}>
            <div style={{ background: bg, padding: "8px 8px 7px", color: "#fff" }}>
                <div
                    style={{
                        fontSize: "8.5px",
                        fontWeight: 800,
                        color: "#fff",
                        marginBottom: "1px",
                        letterSpacing: "0.3px",
                    }}>
                    {name}
                </div>
                <div style={{ fontSize: "5.5px", color: accent, fontWeight: 600, marginBottom: "3px" }}>
                    {roleTitle}
                </div>
                <div style={{ display: "flex", gap: "5px", opacity: 0.75, fontSize: "4px", flexWrap: "wrap" }}>
                    {email && <span>{email}</span>}
                    {phone && <span>· {phone}</span>}
                    {loc && <span>· {loc}</span>}
                </div>
            </div>
            <div style={{ padding: "5px 8px" }}>
                {summary?.text && (
                    <div style={{ marginBottom: "5px" }}>
                        <div
                            style={{
                                fontSize: "4.5px",
                                fontWeight: 700,
                                color: accent,
                                borderBottom: `1px solid ${accent}55`,
                                paddingBottom: "1px",
                                marginBottom: "2px",
                            }}>
                            PROFIL
                        </div>
                        <MiniPara text={summary.text} color="#444" />
                    </div>
                )}
                {exp.length > 0 && (
                    <div style={{ marginBottom: "5px" }}>
                        <div
                            style={{
                                fontSize: "4.5px",
                                fontWeight: 700,
                                color: accent,
                                borderBottom: `1px solid ${accent}55`,
                                paddingBottom: "1px",
                                marginBottom: "3px",
                            }}>
                            EXPÉRIENCE
                        </div>
                        {exp.slice(0, 2).map((e, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: "3px",
                                    paddingLeft: "4px",
                                    borderLeft: `1.5px solid ${accent}30`,
                                }}>
                                <MiniRow color="#111" text={e.position || ""} bold />
                                <MiniRow color={accent} text={e.company || ""} />
                                {e.description && <MiniPara text={e.description} color="#666" />}
                            </div>
                        ))}
                    </div>
                )}
                {skills.length > 0 && (
                    <div>
                        <div
                            style={{
                                fontSize: "4.5px",
                                fontWeight: 700,
                                color: accent,
                                borderBottom: `1px solid ${accent}55`,
                                paddingBottom: "1px",
                                marginBottom: "3px",
                            }}>
                            COMPÉTENCES
                        </div>
                        <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
                            {skills
                                .flatMap((g) => g.skills ?? [])
                                .slice(0, 8)
                                .map((s, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            background: `${accent}18`,
                                            borderRadius: "99px",
                                            padding: "1px 4px",
                                            fontSize: "4px",
                                            color: "#333",
                                        }}>
                                        {s}
                                    </span>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MiniLabel({ color, text }: { color: string; text: string }) {
    return (
        <div style={{ fontSize: "4.5px", fontWeight: 700, color, marginBottom: "3px", letterSpacing: "0.5px" }}>
            {text}
        </div>
    );
}

function MiniRow({ color, text, bold }: { color: string; text: string; bold?: boolean }) {
    return (
        <div
            style={{
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
        <div
            style={{
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

function MenuItem({
    icon,
    label,
    onClick,
    danger,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                border: "none",
                borderRadius: "8px",
                padding: "7px 10px",
                fontSize: "12.5px",
                fontWeight: 500,
                color: danger ? "#dc2626" : "var(--gb-text-off)",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gb-app-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            {icon} {label}
        </button>
    );
}

function formatRelative(date: Date): string {
    const diff = Date.now() - date.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `Il y a ${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `Il y a ${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `Il y a ${d}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
