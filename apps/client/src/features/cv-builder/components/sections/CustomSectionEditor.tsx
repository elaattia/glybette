import { useMemo, useState } from "react";
import { Plus, Trash2, Type, AlignLeft, Calendar, MapPin, List, Link } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { Input, Textarea, Label, addBtn, delBtn, itemBox } from "./primitives";
import { DatePicker } from "./inputs/DatePicker";
import { LocationPicker } from "./inputs/LocationPicker";

export type CustomFieldType = "text" | "textarea" | "date" | "location" | "list" | "link";

export interface CustomField {
    id: string;
    type: CustomFieldType;
    label: string;
    value: string;
}

export interface CustomSectionDataV2 {
    title: string;
    fields: CustomField[];
}

const FIELD_TYPE_ICONS: Record<CustomFieldType, React.ComponentType<{ size?: number }>> = {
    text: Type,
    textarea: AlignLeft,
    date: Calendar,
    location: MapPin,
    list: List,
    link: Link,
};

const FIELD_TYPE_KEYS: CustomFieldType[] = ["text", "textarea", "date", "location", "list", "link"];

interface CustomSectionEditorProps {
    data: CustomSectionDataV2;
    onChange: (d: CustomSectionDataV2) => void;
}

export function CustomSectionEditor({ data, onChange }: CustomSectionEditorProps) {
    const { t } = useLocale("cvBuilder");
    const [addingType, setAddingType] = useState(false);
    const [listInputs, setListInputs] = useState<Record<string, string>>({});

    const fieldTypes = useMemo(
        () =>
            FIELD_TYPE_KEYS.map((type) => ({
                type,
                label: t(`sections.custom.fieldTypes.${type}.label`),
                desc: t(`sections.custom.fieldTypes.${type}.desc`),
                Icon: FIELD_TYPE_ICONS[type],
            })),
        [t],
    );

    const addField = (type: CustomFieldType) => {
        const typeInfo = fieldTypes.find((ft) => ft.type === type)!;
        onChange({ ...data, fields: [...data.fields, { id: crypto.randomUUID(), type, label: typeInfo.label, value: "" }] });
        setAddingType(false);
    };

    const updField = (id: string, key: keyof CustomField, val: string) =>
        onChange({ ...data, fields: data.fields.map((f) => (f.id === id ? { ...f, [key]: val } : f)) });

    const delField = (id: string) => onChange({ ...data, fields: data.fields.filter((f) => f.id !== id) });

    const addListItem = (fieldId: string) => {
        const item = listInputs[fieldId]?.trim();
        if (!item) return;
        const field = data.fields.find((f) => f.id === fieldId);
        if (!field) return;
        const items = field.value ? field.value.split("\n") : [];
        updField(fieldId, "value", [...items, item].join("\n"));
        setListInputs((p) => ({ ...p, [fieldId]: "" }));
    };

    const removeListItem = (fieldId: string, item: string) => {
        const field = data.fields.find((f) => f.id === fieldId);
        if (!field) return;
        updField(fieldId, "value", field.value.split("\n").filter((i) => i !== item).join("\n"));
    };

    return (
        <div>
            <div style={{ marginBottom: "14px" }}>
                <Label>{t("sections.custom.sectionTitle")}</Label>
                <Input
                    value={data.title}
                    placeholder={t("sections.custom.sectionTitlePlaceholder")}
                    onChange={(e) => onChange({ ...data, title: e.target.value })}
                />
            </div>

            {data.fields.map((field) => {
                const fieldType = fieldTypes.find((ft) => ft.type === field.type);
                const FieldIcon = fieldType?.Icon;
                return (
                    <div key={field.id} style={{ ...itemBox, marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
                            <span style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A", borderRadius: "6px", padding: "2px 7px", fontSize: "10.5px", fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
                                {FieldIcon && <FieldIcon size={11} />} {fieldType?.label}
                            </span>
                            <input
                                value={field.label}
                                onChange={(e) => updField(field.id, "label", e.target.value)}
                                placeholder={t("sections.custom.fieldNamePlaceholder")}
                                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "12px", fontWeight: 600, color: "var(--gb-text)", fontFamily: "inherit" }}
                            />
                            <button style={delBtn} onClick={() => delField(field.id)}>
                                <Trash2 style={{ width: 12, height: 12 }} />
                            </button>
                        </div>

                        {field.type === "text" && <Input value={field.value} placeholder={t("sections.custom.placeholders.value")} onChange={(e) => updField(field.id, "value", e.target.value)} />}
                        {field.type === "textarea" && <Textarea value={field.value} rows={3} placeholder={t("sections.custom.placeholders.description")} onChange={(e) => updField(field.id, "value", e.target.value)} />}
                        {field.type === "date" && <DatePicker value={field.value} onChange={(v) => updField(field.id, "value", v)} />}
                        {field.type === "location" && <LocationPicker value={field.value} onChange={(v) => updField(field.id, "value", v)} />}
                        {field.type === "link" && <Input value={field.value} placeholder={t("sections.custom.placeholders.link")} onChange={(e) => updField(field.id, "value", e.target.value)} />}
                        {field.type === "list" && (
                            <div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "7px" }}>
                                    {field.value.split("\n").filter(Boolean).map((item) => (
                                        <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "99px", padding: "3px 9px", fontSize: "12px", color: "var(--gb-text-off)" }}>
                                            {item}
                                            <button onClick={() => removeListItem(field.id, item)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gb-muted)", padding: 0, lineHeight: 1, fontSize: "13px" }}>×</button>
                                        </span>
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: "6px" }}>
                                    <Input
                                        value={listInputs[field.id] ?? ""}
                                        placeholder={t("sections.custom.placeholders.listItem")}
                                        onChange={(e) => setListInputs((p) => ({ ...p, [field.id]: e.target.value }))}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addListItem(field.id); } }}
                                        style={{ flex: 1, fontSize: "12px" }}
                                    />
                                    <button onClick={() => addListItem(field.id)} style={{ background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "9px", padding: "0 12px", cursor: "pointer", color: "var(--gb-text-off)", fontSize: "12px", flexShrink: 0 }}>+</button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {!addingType ? (
                <button style={addBtn}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(22,163,74,0.4)"; e.currentTarget.style.color = "#16A34A"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--gb-border2)"; e.currentTarget.style.color = "var(--gb-muted)"; }}
                    onClick={() => setAddingType(true)}>
                    <Plus style={{ width: 13, height: 13 }} /> {t("sections.custom.addField")}
                </button>
            ) : (
                <div style={{ background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)", borderRadius: "12px", padding: "12px" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--gb-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>{t("sections.custom.fieldType")}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                        {fieldTypes.map((ft) => {
                            const FtIcon = ft.Icon;
                            return (
                                <button key={ft.type} onClick={() => addField(ft.type)}
                                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "10px", padding: "10px 8px", cursor: "pointer", textAlign: "center" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(22,163,74,0.4)"; e.currentTarget.style.background = "rgba(22,163,74,0.05)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--gb-border)"; e.currentTarget.style.background = "var(--gb-surface)"; }}>
                                    <FtIcon size={16} />
                                    <span style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--gb-text)" }}>{ft.label}</span>
                                    <span style={{ fontSize: "9px", color: "var(--gb-muted)" }}>{ft.desc}</span>
                                </button>
                            );
                        })}
                    </div>
                    <button onClick={() => setAddingType(false)} style={{ marginTop: "8px", width: "100%", background: "transparent", border: "none", fontSize: "12px", color: "var(--gb-muted)", cursor: "pointer", padding: "4px" }}>
                        {t("sections.custom.cancel")}
                    </button>
                </div>
            )}
        </div>
    );
}
