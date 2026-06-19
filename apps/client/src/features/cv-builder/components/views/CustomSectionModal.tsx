import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { CustomSectionEditor } from "../sections/CustomSectionEditor";
import type { CustomSectionDataV2 } from "../sections/CustomSectionEditor";
import type { CvSection } from "../../types/cv.types";
import { useSectionDefs } from "./sectionDefs";

interface CustomSectionModalProps {
    onClose: () => void;
    onAdd: (section: CvSection) => void;
    existingTypes: Set<string>;
    nextOrder: number;
}

export function CustomSectionModal({ onClose, onAdd, existingTypes, nextOrder }: CustomSectionModalProps) {
    const { t } = useLocale("cvBuilder");
    const sectionDefs = useSectionDefs();
    const [customData, setCustomData] = useState<CustomSectionDataV2>({ title: "", fields: [] });

    const available = sectionDefs.filter((d) => !existingTypes.has(d.type));

    const handleAddPredefined = (def: (typeof sectionDefs)[0]) => {
        onAdd({ type: def.type, order: nextOrder, data: def.defaultData as never });
        onClose();
    };

    const handleAddCustom = () => {
        if (!customData.title.trim()) return;
        onAdd({ type: "custom", order: nextOrder, label: customData.title.trim(), data: customData as never });
        onClose();
    };

    return (
        <>
            <div
                style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                onClick={onClose}
            />
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    zIndex: 50,
                    width: "min(96vw, 520px)",
                    maxHeight: "88vh",
                    overflowY: "auto",
                    background: "var(--gb-surface)",
                    border: "1px solid var(--gb-border)",
                    borderRadius: "20px",
                    padding: "24px",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--gb-text)" }}>{t("sections.custom.modalTitle")}</h3>
                        <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--gb-muted)" }}>{t("sections.custom.modalSubtitle")}</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: "var(--gb-app-hover)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "var(--gb-muted)", display: "flex" }}>
                        <X style={{ width: 15, height: 15 }} />
                    </button>
                </div>

                {available.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                        <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--gb-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
                            {t("sections.custom.available")}
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
                            {available.map((def) => (
                                <button
                                    key={def.type}
                                    onClick={() => handleAddPredefined(def)}
                                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)", borderRadius: "10px", padding: "10px 12px", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s, background 0.15s" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(22,163,74,0.5)"; e.currentTarget.style.background = "rgba(22,163,74,0.06)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--gb-border)"; e.currentTarget.style.background = "var(--gb-app-hover)"; }}>
                                    <span style={{ color: "#16A34A", display: "flex", flexShrink: 0 }}>{def.icon}</span>
                                    <span style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--gb-text)" }}>{def.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                    <div style={{ flex: 1, height: "1px", background: "var(--gb-border)" }} />
                    <span style={{ fontSize: "11px", color: "var(--gb-muted)", whiteSpace: "nowrap" }}>{t("sections.custom.customDivider")}</span>
                    <div style={{ flex: 1, height: "1px", background: "var(--gb-border)" }} />
                </div>

                <CustomSectionEditor data={customData} onChange={setCustomData} />

                <button
                    onClick={handleAddCustom}
                    disabled={!customData.title.trim()}
                    style={{
                        marginTop: "16px",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "7px",
                        background: customData.title.trim() ? "linear-gradient(90deg,#16A34A,#0284C7)" : "var(--gb-app-hover)",
                        color: customData.title.trim() ? "#fff" : "var(--gb-muted)",
                        border: "none",
                        borderRadius: "10px",
                        padding: "11px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: customData.title.trim() ? "pointer" : "not-allowed",
                    }}>
                    <Plus style={{ width: 14, height: 14 }} />
                    {t("sections.custom.createCustom")}
                </button>
            </div>
        </>
    );
}
