import { Award } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { Input, Field, AddButton, DeleteButton, itemBox, grid2 } from "./primitives";
import { DatePicker } from "./inputs/DatePicker";
import type { CertificationItem } from "../../types/cv.types";

interface CertificationsProps {
    data: CertificationItem[];
    onChange: (d: CertificationItem[]) => void;
}

export function CertificationsSection({ data, onChange }: CertificationsProps) {
    const { t } = useLocale("cvBuilder");
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
                            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--gb-muted)" }}>{t("sections.certifications.itemNumber", { number: idx + 1 })}</span>
                        </div>
                        <DeleteButton onClick={() => del(item.id)} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                        <Field label={t("sections.certifications.name")}>
                            <Input value={item.name} placeholder={t("sections.certifications.placeholders.name")} onChange={(e) => upd(item.id, "name", e.target.value)} />
                        </Field>
                        <div style={grid2}>
                            <Field label={t("sections.certifications.issuer")}>
                                <Input value={item.issuer} placeholder={t("sections.certifications.placeholders.issuer")} onChange={(e) => upd(item.id, "issuer", e.target.value)} />
                            </Field>
                            <Field label={t("sections.certifications.date")}>
                                <DatePicker value={item.date} onChange={(v) => upd(item.id, "date", v)} />
                            </Field>
                        </div>
                        <Field label={t("sections.certifications.url")}>
                            <Input value={item.url} placeholder={t("sections.certifications.placeholders.url")} onChange={(e) => upd(item.id, "url", e.target.value)} />
                        </Field>
                    </div>
                </div>
            ))}
            <AddButton label={t("sections.certifications.add")} onClick={add} />
        </div>
    );
}
