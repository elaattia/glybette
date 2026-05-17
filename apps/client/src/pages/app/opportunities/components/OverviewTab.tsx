import React, { useState } from "react";
import { Globe, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { detailStyles as styles } from "../styles";
import { SOURCE_ICONS } from "../constants";
import type { Offre } from "../types";

interface OverviewTabProps {
    offre: Offre;
}

export function OverviewTab({ offre }: OverviewTabProps) {
    const [descExpanded, setDescExpanded] = useState(false);

    return (
        <div style={styles.tabContent}>
            {offre.competences.length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Compétences requises</div>
                    <div style={styles.skillsRow}>
                        {offre.competences.map((s, i) => (
                            <span key={i} style={styles.skillTagGreen}>{s}</span>
                        ))}
                    </div>
                </div>
            )}

            {offre.description && (
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Description du poste</div>
                    <div style={{
                        fontSize: 13.5, lineHeight: 1.8, color: "var(--gb-text-off)",
                        whiteSpace: "pre-line", maxHeight: descExpanded ? "none" : 260, overflow: "hidden",
                    }}>
                        {offre.description}
                    </div>
                    <button onClick={() => setDescExpanded(!descExpanded)} style={styles.expandBtn}>
                        {descExpanded
                            ? <><ChevronUp size={13} /> Réduire</>
                            : <><ChevronDown size={13} /> Voir plus</>
                        }
                    </button>
                </div>
            )}

            {offre.company_about && (
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>À propos de l'entreprise</div>
                    <div style={styles.companyAboutBox}>{offre.company_about}</div>
                </div>
            )}

            <div style={styles.section}>
                <div style={styles.sectionTitle}>Informations</div>
                <div style={styles.infoGrid}>
                    {[
                        { label: "Source",  value: offre.source_site },
                        { label: "Type",    value: offre.type_offre },
                        offre.domaine           ? { label: "Domaine",  value: offre.domaine }           : null,
                        offre.taille_entreprise ? { label: "Taille",   value: offre.taille_entreprise } : null,
                        offre.niveau_experience ? { label: "Niveau",   value: offre.niveau_experience } : null,
                        offre.type_contrat      ? { label: "Contrat",  value: offre.type_contrat }      : null,
                    ].filter(Boolean).map((item: any, i) => (
                        <div key={i} style={styles.infoCell}>
                            <div style={styles.infoLabel}>{item.label}</div>
                            <div style={styles.infoValue}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {(offre.email_contact || offre.telephone || offre.site_web_entreprise) && (
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Contact</div>
                    <div style={styles.contactList}>
                        {offre.email_contact && (
                            <a href={`mailto:${offre.email_contact}`} style={styles.contactItem}>
                                <Mail size={13} style={{ color: "#38bdf8" }} />{offre.email_contact}
                            </a>
                        )}
                        {offre.telephone && (
                            <div style={styles.contactItem}>
                                <Phone size={13} style={{ color: "#22c55e" }} />{offre.telephone}
                            </div>
                        )}
                        {offre.site_web_entreprise && (
                            <a href={offre.site_web_entreprise} target="_blank" rel="noopener noreferrer" style={styles.contactItem}>
                                <Globe size={13} style={{ color: "#a78bfa" }} />{offre.site_web_entreprise}
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}