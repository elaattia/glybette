import { useState } from "react";
import { Edit3, Download, Trash2, Clock, Target, MoreVertical, Copy, Share2, Loader } from "lucide-react";
import type { CvDTO } from "../../types/cv.types";
import { getTemplate } from "../../templates";
import { MiniCvPreview } from "./MiniCvPreview";

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
            <div style={{ height: "180px", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", position: "relative", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: "3px", boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)", overflow: "hidden", position: "relative" }}>
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
                    <div style={{ position: "absolute", top: "14px", right: "14px", background: atsColor!, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", boxShadow: `0 2px 6px ${atsColor}50` }}>
                        ATS {cv.atsScore}%
                    </div>
                )}

                {cv.isPublic && (
                    <div style={{ position: "absolute", top: "14px", left: "14px", background: "rgba(22,163,74,0.85)", backdropFilter: "blur(4px)", color: "#fff", fontSize: "9px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Share2 style={{ width: 9, height: 9 }} /> Public
                    </div>
                )}

                <div style={{ position: "absolute", bottom: "14px", left: "14px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", color: "#fff", fontSize: "9px", fontWeight: 500, padding: "2px 8px", borderRadius: "99px" }}>
                    {tpl.name}
                </div>
            </div>

            <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: "0 0 5px", fontSize: "14px", fontWeight: 600, color: "var(--gb-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {cv.title}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--gb-muted)", fontSize: "11.5px" }}>
                            <Clock style={{ width: 11, height: 11 }} />{timeAgo}
                        </div>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                        style={{ background: "transparent", border: "1px solid var(--gb-border)", borderRadius: "7px", padding: "4px 6px", cursor: "pointer", color: "var(--gb-muted)", flexShrink: 0, display: "flex" }}>
                        <MoreVertical style={{ width: 14, height: 14 }} />
                    </button>
                </div>

                {cv.atsScore != null && (
                    <div style={{ marginTop: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                            <span style={{ fontSize: "11px", color: "var(--gb-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
                                <Target style={{ width: 10, height: 10 }} /> ATS Score
                            </span>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: atsColor! }}>{cv.atsScore}/100</span>
                        </div>
                        <div style={{ height: "4px", background: "var(--gb-app-hover)", borderRadius: "99px" }}>
                            <div style={{ height: "100%", width: `${cv.atsScore}%`, background: atsColor!, borderRadius: "99px", transition: "width 0.6s ease" }} />
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "12px", borderTop: "1px solid var(--gb-border)", paddingTop: "12px" }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(cv); }}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "linear-gradient(90deg, #16A34A, #0284C7)", color: "#fff", border: "none", borderRadius: "9px", padding: "7px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                        <Edit3 style={{ width: 12, height: 12 }} /> Modifier
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onExportPdf(cv._id); }}
                        disabled={isExporting}
                        title="Exporter PDF"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)", borderRadius: "9px", padding: "7px 11px", fontSize: "12px", fontWeight: 500, color: "var(--gb-text-off)", cursor: isExporting ? "wait" : "pointer", flexShrink: 0 }}>
                        {isExporting ? <Loader style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : <Download style={{ width: 12, height: 12 }} />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                    <div style={{ position: "absolute", top: "14px", right: "14px", zIndex: 20, background: "var(--gb-app-panel-bg)", border: "1px solid var(--gb-border)", borderRadius: "12px", padding: "5px", minWidth: "160px", boxShadow: "0 8px 28px rgba(0,0,0,0.2)" }}>
                        <MenuItem icon={<Edit3 style={{ width: 13, height: 13 }} />} label="Modifier" onClick={() => { setMenuOpen(false); onEdit(cv); }} />
                        <MenuItem icon={<Copy style={{ width: 13, height: 13 }} />} label="Dupliquer" onClick={() => { setMenuOpen(false); onDuplicate(cv._id); }} />
                        <MenuItem icon={<Download style={{ width: 13, height: 13 }} />} label="Exporter PDF" onClick={() => { setMenuOpen(false); onExportPdf(cv._id); }} />
                        <div style={{ height: "1px", background: "var(--gb-border)", margin: "3px 0" }} />
                        <MenuItem icon={<Trash2 style={{ width: 13, height: 13 }} />} label="Supprimer" danger onClick={() => { setMenuOpen(false); onDelete(cv._id); }} />
                    </div>
                </>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", borderRadius: "8px", padding: "7px 10px", fontSize: "12.5px", fontWeight: 500, color: danger ? "#dc2626" : "var(--gb-text-off)", cursor: "pointer", textAlign: "left", transition: "background 0.12s" }}
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