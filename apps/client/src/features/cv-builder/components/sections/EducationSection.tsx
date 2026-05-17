import { Input, Field, AddButton, DeleteButton, itemBox, grid2 } from "./primitives";
import { DatePicker } from "./inputs/DatePicker";
import type { EducationItem } from "../../types/cv.types";

interface EducationProps {
    data: EducationItem[];
    onChange: (d: EducationItem[]) => void;
}

export function EducationSection({ data, onChange }: EducationProps) {
    const add = () =>
        onChange([...data, { id: crypto.randomUUID(), institution: "", degree: "", field: "", startDate: "", endDate: "", current: false, gpa: "", description: "" }]);
    const upd = (id: string, k: keyof EducationItem, v: unknown) =>
        onChange(data.map((i) => (i.id === id ? { ...i, [k]: v } : i)));
    const del = (id: string) => onChange(data.filter((i) => i.id !== id));

    return (
        <div>
            {data.map((item, idx) => (
                <div key={item.id} style={itemBox}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "11px" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--gb-muted)" }}>Formation {idx + 1}</span>
                        <DeleteButton onClick={() => del(item.id)} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                        <Field label="Établissement">
                            <Input value={item.institution} placeholder="Université de Tunis" onChange={(e) => upd(item.id, "institution", e.target.value)} />
                        </Field>
                        <div style={grid2}>
                            <Field label="Diplôme">
                                <Input value={item.degree} placeholder="Master / Licence" onChange={(e) => upd(item.id, "degree", e.target.value)} />
                            </Field>
                            <Field label="Spécialité">
                                <Input value={item.field} placeholder="Informatique" onChange={(e) => upd(item.id, "field", e.target.value)} />
                            </Field>
                        </div>
                        <div style={grid2}>
                            <Field label="Début">
                                <DatePicker value={item.startDate} onChange={(v) => upd(item.id, "startDate", v)} />
                            </Field>
                            <Field label="Obtention">
                                <DatePicker value={item.endDate} onChange={(v) => upd(item.id, "endDate", v)} />
                            </Field>
                        </div>
                        <Field label="Mention / GPA (optionnel)">
                            <Input value={item.gpa} placeholder="Très bien / 16.5/20" onChange={(e) => upd(item.id, "gpa", e.target.value)} />
                        </Field>
                    </div>
                </div>
            ))}
            <AddButton label="Ajouter une formation" onClick={add} />
        </div>
    );
}