import { useLocale } from "@/hooks/useLocale";
import { Input, Textarea, Label, Field, AddButton, DeleteButton, itemBox, grid2, grid3 } from "./primitives";
import { DatePicker } from "./inputs/DatePicker";
import { LocationPicker } from "./inputs/LocationPicker";
import { AiEnhanceButton } from "../ai/AiEnhanceButton";
import type { ExperienceItem } from "../../types/cv.types";

interface ExperienceProps {
    data: ExperienceItem[];
    onChange: (d: ExperienceItem[]) => void;
    enhancingKey?: string | null;
    onAiEnhance?: (itemId: string, currentText: string) => void;
}

export function ExperienceSection({ data, onChange, enhancingKey, onAiEnhance }: ExperienceProps) {
    const { t } = useLocale("cvBuilder");
    const add = () =>
        onChange([...data, { id: crypto.randomUUID(), company: "", position: "", startDate: "", endDate: "", current: false, location: "", description: "", highlights: [] }]);
    const upd = (id: string, k: keyof ExperienceItem, v: unknown) =>
        onChange(data.map((i) => (i.id === id ? { ...i, [k]: v } : i)));
    const del = (id: string) => onChange(data.filter((i) => i.id !== id));

    return (
        <div>
            {data.map((item, idx) => (
                <div key={item.id} style={itemBox}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "11px" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--gb-muted)" }}>{t("sections.experience.positionNumber", { number: idx + 1 })}</span>
                        <DeleteButton onClick={() => del(item.id)} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                        <div style={grid2}>
                            <Field label={t("sections.experience.position")}>
                                <Input value={item.position} placeholder={t("sections.experience.placeholders.position")} onChange={(e) => upd(item.id, "position", e.target.value)} />
                            </Field>
                            <Field label={t("sections.experience.company")}>
                                <Input value={item.company} placeholder={t("sections.experience.placeholders.company")} onChange={(e) => upd(item.id, "company", e.target.value)} />
                            </Field>
                        </div>
                        <div style={grid3}>
                            <Field label={t("sections.experience.start")}>
                                <DatePicker value={item.startDate} onChange={(v) => upd(item.id, "startDate", v)} placeholder={t("sections.experience.placeholders.date")} />
                            </Field>
                            <Field label={t("sections.experience.end")}>
                                <DatePicker value={item.endDate} onChange={(v) => upd(item.id, "endDate", v)} placeholder={t("sections.experience.placeholders.date")} disabled={item.current} />
                            </Field>
                            <Field label={t("sections.experience.current")}>
                                <div style={{ display: "flex", alignItems: "center", height: "38px", gap: "7px" }}>
                                    <input
                                        type="checkbox"
                                        checked={item.current}
                                        onChange={(e) => upd(item.id, "current", e.target.checked)}
                                        style={{ accentColor: "#16A34A", width: 16, height: 16, cursor: "pointer" }}
                                    />
                                    <span style={{ fontSize: "12px", color: "var(--gb-text-off)" }}>{t("sections.experience.currentLabel")}</span>
                                </div>
                            </Field>
                        </div>
                        <Field label={t("sections.experience.location")}>
                            <LocationPicker value={item.location} onChange={(v) => upd(item.id, "location", v)} />
                        </Field>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                                <Label>{t("sections.experience.description")}</Label>
                                {onAiEnhance && (
                                    <AiEnhanceButton
                                        onClick={() => onAiEnhance(item.id, item.description)}
                                        isLoading={enhancingKey === `exp-${item.id}`}
                                        disabled={!item.description.trim()}
                                        label={t("sections.experience.enhance")}
                                    />
                                )}
                            </div>
                            <Textarea
                                value={item.description}
                                placeholder={t("sections.experience.placeholders.description")}
                                onChange={(e) => upd(item.id, "description", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            ))}
            <AddButton label={t("sections.experience.add")} onClick={add} />
        </div>
    );
}
