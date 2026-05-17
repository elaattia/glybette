import React from "react";
import { MapPin, Briefcase, Globe, Star, BookOpen, Clock, ExternalLink } from "lucide-react";
import { detailStyles as styles } from "../styles";
import { timeAgo, SOURCE_ICONS, TYPE_COLORS } from "../constants";
import type { Offre } from "../types";

function Chip({ icon, children, accent, green }: { icon?: React.ReactNode; children: React.ReactNode; accent?: boolean; green?: boolean }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px",
            borderRadius: 100, fontSize: 12, fontWeight: 500,
            background: green ? "rgba(22,163,74,0.1)" : accent ? "rgba(2,132,199,0.1)" : "var(--gb-app-hover)",
            border: `1px solid ${green ? "rgba(22,163,74,0.25)" : accent ? "rgba(2,132,199,0.25)" : "var(--gb-border)"}`,
            color: green ? "#22c55e" : accent ? "#38bdf8" : "var(--gb-text-off)",
        }}>
            {icon}{children}
        </span>
    );
}

interface JobHeaderCardProps {
    offre: Offre;
}

export function JobHeaderCard({ offre }: JobHeaderCardProps) {
    const typeColors = TYPE_COLORS[offre.type_offre] ?? TYPE_COLORS.emploi;

    return (
        <div style={styles.headerCard}>
            <div style={styles.headerTop}>
                <div style={styles.logoWrap}>
                    {offre.lien_image
                        ? <img src={offre.lien_image} alt="" style={styles.logo}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        : <span style={{ fontSize: 22 }}>{SOURCE_ICONS[offre.source_site] ?? <Globe size={22} />}</span>
                    }
                </div>
                <div style={{ flex: 1 }}>
                    <div style={styles.typeBadge(typeColors)}>
                        <span style={styles.typeDot(typeColors.text)} />
                        {offre.type_offre}
                    </div>
                    <h1 style={styles.jobTitle}>{offre.titre}</h1>
                    <p style={styles.company}>{offre.entreprise ?? "Entreprise"}</p>
                </div>
            </div>

            <div style={styles.chips}>
                {offre.localisation      && <Chip icon={<MapPin    size={11} />}>{offre.localisation}</Chip>}
                {offre.type_contrat      && <Chip icon={<Briefcase size={11} />}>{offre.type_contrat}</Chip>}
                {offre.teletravail       && <Chip icon={<Globe     size={11} />} accent>{offre.teletravail}</Chip>}
                {offre.salaire           && <Chip icon={<Star      size={11} />} green>{offre.salaire}</Chip>}
                {offre.niveau_experience && <Chip icon={<BookOpen  size={11} />}>{offre.niveau_experience}</Chip>}
            </div>

            <div style={styles.quickStats}>
                <span style={styles.statItem}>
                    <Clock size={11} style={{ color: "var(--gb-muted)" }} />
                    {timeAgo(offre.date_publication ?? offre.date_scraped)}
                </span>
                <span style={styles.statSep} />
                <span style={styles.statItem}>
                    <span style={{ color: "var(--gb-muted)", fontSize: 11 }}>{offre.nb_vues} vues</span>
                </span>
            </div>

            <a href={offre.lien_original} target="_blank" rel="noopener noreferrer" style={styles.applyBtn}>
                Postuler maintenant <ExternalLink size={14} />
            </a>
        </div>
    );
}