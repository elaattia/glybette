import { Check, Star } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { getLocalizedTemplate } from "../../lib/cv-i18n";
import type { TemplateInfo } from "../../types/cv.types";
import { MiniTemplatePreview } from "./MiniTemplatePreview";

interface TemplateCardProps {
    template: TemplateInfo;
    isSelected: boolean;
    onClick: () => void;
}

export function TemplateCard({ template, isSelected, onClick }: TemplateCardProps) {
    const { t } = useLocale("cvBuilder");
    const localized = getLocalizedTemplate(t, template.id);

    return (
        <button
            onClick={onClick}
            style={{
                cursor: "pointer",
                borderRadius: "16px",
                overflow: "hidden",
                border: `2px solid ${isSelected ? template.accentColor : "transparent"}`,
                background: "var(--gb-app-panel-bg)",
                padding: 0,
                transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: isSelected
                    ? `0 0 0 4px ${template.accentColor}30, 0 8px 32px rgba(0,0,0,0.18)`
                    : "0 2px 12px rgba(0,0,0,0.1)",
                position: "relative",
                textAlign: "left",
                width: "100%",
            }}
            onMouseEnter={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.2)";
                    e.currentTarget.style.border = `2px solid ${template.accentColor}80`;
                }
            }}
            onMouseLeave={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.1)";
                    e.currentTarget.style.border = "2px solid transparent";
                }
            }}>
            <div style={{ height: "210px", position: "relative", overflow: "hidden", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px" }}>
                <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: "3px", boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)", overflow: "hidden", position: "relative" }}>
                    <MiniTemplatePreview template={template} />
                </div>

                {template.isAtsReady && (
                    <div style={{ position: "absolute", top: "14px", left: "14px", background: "#16A34A", color: "#fff", fontSize: "8.5px", fontWeight: 800, padding: "3px 9px", borderRadius: "99px", letterSpacing: "0.08em", zIndex: 3, boxShadow: "0 2px 8px rgba(22,163,74,0.4)", textTransform: "uppercase" }}>
                        {t("templates.badges.atsReady")}
                    </div>
                )}

                {template.category === "fancy" && (
                    <div style={{ position: "absolute", top: "14px", right: "14px", background: template.accentColor, color: "#fff", fontSize: "8.5px", fontWeight: 800, padding: "3px 9px", borderRadius: "99px", letterSpacing: "0.08em", zIndex: 3, display: "flex", alignItems: "center", gap: "3px", boxShadow: `0 2px 8px ${template.accentColor}60` }}>
                        <Star style={{ width: 8, height: 8 }} /> {t("templates.badges.fancy")}
                    </div>
                )}

                {isSelected && (
                    <div style={{ position: "absolute", bottom: "14px", right: "14px", width: "26px", height: "26px", borderRadius: "50%", background: template.accentColor, zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 10px ${template.accentColor}60` }}>
                        <Check style={{ width: 13, height: 13, color: "#fff" }} />
                    </div>
                )}
            </div>

            <div style={{ padding: "10px 12px 11px", borderTop: "1px solid var(--gb-border)", background: "var(--gb-app-panel-bg)" }}>
                <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 700, color: "var(--gb-text)", lineHeight: 1.3 }}>{localized.name}</p>
                <p style={{ margin: "3px 0 0", fontSize: "10.5px", color: "var(--gb-muted)", lineHeight: 1.4 }}>{localized.description}</p>
            </div>
        </button>
    );
}
