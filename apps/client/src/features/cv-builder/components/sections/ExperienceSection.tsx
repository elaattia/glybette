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
                        <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--gb-muted)" }}>Position {idx + 1}</span>
                        <DeleteButton onClick={() => del(item.id)} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                        <div style={grid2}>
                            <Field label="Poste">
                                <Input value={item.position} placeholder="Senior Developer" onChange={(e) => upd(item.id, "position", e.target.value)} />
                            </Field>
                            <Field label="Entreprise">
                                <Input value={item.company} placeholder="TechCorp" onChange={(e) => upd(item.id, "company", e.target.value)} />
                            </Field>
                        </div>
                        <div style={grid3}>
                            <Field label="Début">
                                <DatePicker value={item.startDate} onChange={(v) => upd(item.id, "startDate", v)} placeholder="Mois Année" />
                            </Field>
                            <Field label="Fin">
                                <DatePicker value={item.endDate} onChange={(v) => upd(item.id, "endDate", v)} placeholder="Mois Année" disabled={item.current} />
                            </Field>
                            <Field label="En poste">
                                <div style={{ display: "flex", alignItems: "center", height: "38px", gap: "7px" }}>
                                    <input
                                        type="checkbox"
                                        checked={item.current}
                                        onChange={(e) => upd(item.id, "current", e.target.checked)}
                                        style={{ accentColor: "#16A34A", width: 16, height: 16, cursor: "pointer" }}
                                    />
                                    <span style={{ fontSize: "12px", color: "var(--gb-text-off)" }}>Actuel</span>
                                </div>
                            </Field>
                        </div>
                        <Field label="Localisation">
                            <LocationPicker value={item.location} onChange={(v) => upd(item.id, "location", v)} />
                        </Field>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                                <Label>Description</Label>
                                {onAiEnhance && (
                                    <AiEnhanceButton
                                        onClick={() => onAiEnhance(item.id, item.description)}
                                        isLoading={enhancingKey === `exp-${item.id}`}
                                        disabled={!item.description.trim()}
                                        label="Améliorer"
                                    />
                                )}
                            </div>
                            <Textarea
                                value={item.description}
                                placeholder="Décrivez vos responsabilités et résultats avec des métriques..."
                                onChange={(e) => upd(item.id, "description", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            ))}
            <AddButton label="Ajouter une position" onClick={add} />
        </div>
    );
}