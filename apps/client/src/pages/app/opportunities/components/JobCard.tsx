import React, { useState } from "react";
import { MapPin, Clock, Globe, DollarSign, Sparkles } from "lucide-react";
import type { OffreWithScore } from "../types";
import { getTypeColors, timeAgo, SOURCE_ICONS, SOURCE_LABELS } from "../constants";
import { listStyles as s } from "../styles";

export function SkeletonCard() {
    return (
        <div style={s.skCard}>
            <div style={{ display: "flex", gap: 11, marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--gb-bg3)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <div style={{ ...s.skLine, height: 13, width: "65%", marginBottom: 7 }} />
                    <div style={{ ...s.skLine, height: 10, width: "40%" }} />
                </div>
            </div>
            <div style={{ display: "flex", gap: 5, marginBottom: 11 }}>
                <div style={{ ...s.skLine, width: 55, height: 20, borderRadius: 100 }} />
                <div style={{ ...s.skLine, width: 70, height: 20, borderRadius: 100 }} />
            </div>
            <div style={{ ...s.skLine, height: 9, width: "100%", marginBottom: 5 }} />
            <div style={{ ...s.skLine, height: 9, width: "80%" }} />
        </div>
    );
}

interface JobCardProps {
    offre: OffreWithScore;
    onClick: () => void;
}

export const JobCard = React.memo(function JobCard({ offre, onClick }: JobCardProps) {
    const [hovered, setHovered] = useState(false);
    const colors = getTypeColors(offre.type_offre);
    const icon = SOURCE_ICONS[offre.source_site] ?? <Globe size={16} />;
    const isRecommended = offre._isRecommended === true;

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick()}
            style={{
                ...s.card,
                borderColor: hovered
                    ? "var(--gb-app-active-border)"
                    : isRecommended
                        ? "rgba(22,163,74,0.25)"
                        : "var(--gb-border)",
                transform: hovered ? "translateY(-3px)" : "none",
                boxShadow: hovered
                    ? "0 12px 36px rgba(0,0,0,0.25)"
                    : isRecommended
                        ? "0 2px 12px rgba(22,163,74,0.08)"
                        : "none",
                background: hovered ? "var(--gb-app-hover)" : "var(--gb-app-panel-bg)",
            }}>
            {hovered && <div style={s.cardTopLine} />}

            

            <div style={s.cardTop}>
                <div style={s.cardLogo}>
                    {offre.lien_image ? (
                        <img
                            src={offre.lien_image}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <span style={{ fontSize: 18 }}>{icon}</span>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.cardTitle}>{offre.titre}</div>
                    <div style={s.cardCompany}>{offre.entreprise ?? SOURCE_LABELS[offre.source_site]}</div>
                </div>
                {isRecommended && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(22,163,74,0.1)",
                        border: "1px solid rgba(22,163,74,0.25)",
                        flexShrink: 0,
                    }}>
                        <Sparkles size={13} style={{ color: "#22c55e" }} />
                    </div>
                )}
            </div>

            <div style={s.cardTags}>
                <span style={s.typeTag(colors)}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors.dot, flexShrink: 0 }} />
                    {offre.type_offre}
                </span>
                {offre.type_contrat && <span style={s.outlineTag}>{offre.type_contrat}</span>}
                {(offre as any).teletravail && (
                    <span style={{ ...s.outlineTag, color: "#38bdf8", borderColor: "rgba(2,132,199,0.3)" }}>
                        <Globe size={12} /> {(offre as any).teletravail}
                    </span>
                )}
                {offre.domaine && <span style={s.outlineTag}>{offre.domaine}</span>}
            </div>

            {(offre.competences ?? []).length > 0 && (
                <div style={s.cardSkills}>
                    {(offre.competences ?? []).slice(0, 3).map((skill) => (
                        <span key={skill} style={s.skillTag}>{skill}</span>
                    ))}
                    {(offre.competences ?? []).length > 3 && (
                        <span style={{ fontSize: 11, color: "var(--gb-muted)", alignSelf: "center" }}>
                            +{(offre.competences ?? []).length - 3}
                        </span>
                    )}
                </div>
            )}

            <div style={s.cardFooter}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0, flex: 1 }}>
                    {offre.localisation && (
                        <span style={s.locationTag}><MapPin size={10} />{offre.localisation}</span>
                    )}
                    {offre.salaire && (
                        <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>
                            <DollarSign size={12} /> {offre.salaire}
                        </span>
                    )}
                    <span style={s.timeTag}>
                        <Clock size={10} />{timeAgo((offre as any).date_publication ?? offre.date_scraped)}
                    </span>
                </div>
                <span style={s.sourceTag}>{icon} {SOURCE_LABELS[offre.source_site]}</span>
            </div>

            {hovered && <div style={s.viewHint}>Voir les détails →</div>}
        </div>
    );
});