import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { getDomainLabel } from "../../lib/cv-i18n";
import { TemplateCard } from "../TemplateCard/TemplateCard";
import { CreationOptionsModal } from "./CreationOptionsModal";
import { TEMPLATES, filterTemplates } from "../../templates";
import type { CvTemplateCategory, CvTemplateDomain, TemplateInfo } from "../../types/cv.types";

interface TemplatePickerViewProps {
    onBack: () => void;
    onReady: (template: TemplateInfo, mode: "blank" | "upload", file?: File) => void;
    isUploading?: boolean;
}

const ALL_DOMAINS = Array.from(new Set(TEMPLATES.flatMap((t) => t.domains))) as CvTemplateDomain[];

export function TemplatePickerView({ onBack, onReady, isUploading = false }: TemplatePickerViewProps) {
    const { t } = useLocale("cvBuilder");
    const [category, setCategory] = useState<CvTemplateCategory | "all">("all");
    const [domain, setDomain] = useState<CvTemplateDomain | "all">("all");
    const [selected, setSelected] = useState<TemplateInfo | null>(null);
    const [showModal, setShowModal] = useState(false);

    const filtered = filterTemplates(category === "all" ? undefined : category, domain === "all" ? undefined : domain);

    const handleCardClick = (t: TemplateInfo) => {
        setSelected(t);
        setShowModal(true);
    };

    return (
        <div>
            <button
                onClick={onBack}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--gb-muted)",
                    fontSize: "13px",
                    fontWeight: 500,
                    padding: "0 0 18px",
                    transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gb-text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gb-muted)")}>
                <ArrowLeft style={{ width: 14, height: 14 }} /> {t("templates.back")}
            </button>

            <h1
                style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontSize: "1.55rem",
                    fontWeight: 800,
                    color: "var(--gb-text)",
                    letterSpacing: "-0.03em",
                    margin: "0 0 6px",
                }}>
                {t("templates.galleryTitle")}
            </h1>
            <p style={{ fontSize: "13.5px", color: "var(--gb-muted)", marginBottom: "22px" }}>
                {t("templates.gallerySubtitle")}
            </p>

            <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
                <div
                    style={{
                        display: "inline-flex",
                        background: "var(--gb-app-hover)",
                        borderRadius: "12px",
                        padding: "4px",
                        gap: "3px",
                    }}>
                    {(["all", "ats", "fancy"] as const).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            style={{
                                padding: "6px 16px",
                                borderRadius: "9px",
                                border: "none",
                                background: category === cat ? "var(--gb-app-panel-bg)" : "transparent",
                                color: category === cat ? "var(--gb-text)" : "var(--gb-muted)",
                                fontWeight: category === cat ? 600 : 400,
                                fontSize: "12.5px",
                                cursor: "pointer",
                                boxShadow: category === cat ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                                transition: "all 0.15s",
                                fontFamily: "inherit",
                            }}>
                            {t(`templates.categories.${cat}`)}
                        </button>
                    ))}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <button
                        onClick={() => setDomain("all")}
                        style={{
                            padding: "5px 12px",
                            borderRadius: "99px",
                            border: "none",
                            background: domain === "all" ? "#16A34A" : "var(--gb-app-hover)",
                            color: domain === "all" ? "#fff" : "var(--gb-muted)",
                            fontSize: "11.5px",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            fontFamily: "inherit",
                        }}>
                        {t("templates.allDomains")}
                    </button>
                    {ALL_DOMAINS.map((d) => (
                        <button
                            key={d}
                            onClick={() => setDomain(d)}
                            style={{
                                padding: "5px 12px",
                                borderRadius: "99px",
                                border: "none",
                                background: domain === d ? "#16A34A" : "var(--gb-app-hover)",
                                color: domain === d ? "#fff" : "var(--gb-muted)",
                                fontSize: "11.5px",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all 0.15s",
                                fontFamily: "inherit",
                            }}>
                            {getDomainLabel(t, d)}
                        </button>
                    ))}
                </div>
            </div>

            <p style={{ fontSize: "12px", color: "var(--gb-muted)", marginBottom: "14px" }}>
                {t("templates.availableCount", { count: filtered.length })}
            </p>

            {filtered.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "48px 24px",
                        background: "var(--gb-app-panel-bg)",
                        border: "1px dashed var(--gb-border2)",
                        borderRadius: "16px",
                    }}>
                    <p style={{ fontSize: "14px", color: "var(--gb-muted)" }}>
                        {t("templates.emptyFilters")}
                    </p>
                    <button
                        onClick={() => {
                            setCategory("all");
                            setDomain("all");
                        }}
                        style={{
                            marginTop: "12px",
                            padding: "8px 18px",
                            background: "var(--gb-app-hover)",
                            border: "1px solid var(--gb-border)",
                            borderRadius: "9px",
                            fontSize: "13px",
                            color: "var(--gb-text-off)",
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}>
                        {t("templates.resetFilters")}
                    </button>
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                        gap: "14px",
                    }}>
                    {filtered.map((tpl) => (
                        <TemplateCard
                            key={tpl.id}
                            template={tpl}
                            isSelected={selected?.id === tpl.id}
                            onClick={() => handleCardClick(tpl)}
                        />
                    ))}
                </div>
            )}

            {showModal && selected && (
                <CreationOptionsModal
                    template={selected}
                    onClose={() => setShowModal(false)}
                    onCreateBlank={() => {
                        setShowModal(false);
                        onReady(selected, "blank");
                    }}
                    onUpload={(file) => {
                        setShowModal(false);
                        onReady(selected, "upload", file);
                    }}
                    isUploading={isUploading}
                />
            )}
        </div>
    );
}
