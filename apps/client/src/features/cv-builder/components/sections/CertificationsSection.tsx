import { Award } from "lucide-react";
import { Input, Field, AddButton, DeleteButton, itemBox, grid2 } from "./primitives";
import { DatePicker } from "./inputs/DatePicker";
import type { CertificationItem } from "../../types/cv.types";

interface CertificationsProps {
    data: CertificationItem[];
    onChange: (d: CertificationItem[]) => void;
}

export function CertificationsSection({ data, onChange }: CertificationsProps) {
    const add = () => onChange([...data, { id: crypto.randomUUID(), name: "", issuer: "", date: "", url: "" }]);
    const upd = (id: string, k: keyof CertificationItem, v: unknown) =>
        onChange(data.map((i) => (i.id === id ? { ...i, [k]: v } : i)));
    const del = (id: string) => onChange(data.filter((i) => i.id !== id));

    return (
        <div>
            {data.map((item, idx) => (
                <div key={item.id} style={itemBox}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "11px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <Award style={{ width: 13, height: 13, color: "#16A34A" }} />
                            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--gb-muted)" }}>Certification {idx + 1}</span>
                        </div>
                        <DeleteButton onClick={() => del(item.id)} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                        <Field label="Nom de la certification">
                            <Input value={item.name} placeholder="AWS Solutions Architect" onChange={(e) => upd(item.id, "name", e.target.value)} />
                        </Field>
                        <div style={grid2}>
                            <Field label="Organisme">
                                <Input value={item.issuer} placeholder="Amazon / Coursera…" onChange={(e) => upd(item.id, "issuer", e.target.value)} />
                            </Field>
                            <Field label="Date">
                                <DatePicker value={item.date} onChange={(v) => upd(item.id, "date", v)} />
                            </Field>
                        </div>
                        <Field label="URL (optionnel)">
                            <Input value={item.url} placeholder="https://credly.com/…" onChange={(e) => upd(item.id, "url", e.target.value)} />
                        </Field>
                    </div>
                </div>
            ))}
            <AddButton label="Ajouter une certification" onClick={add} />
        </div>
    );
}