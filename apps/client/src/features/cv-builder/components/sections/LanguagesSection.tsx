import { Label, AddButton, DeleteButton, itemBox } from "./primitives";
import { LanguagePicker } from "./inputs/LanguagePicker";
import type { LanguageItem } from "../../types/cv.types";

const LEVELS: LanguageItem["level"][] = ["A1", "A2", "B1", "B2", "C1", "C2", "Native"];
const levelLabel: Record<LanguageItem["level"], string> = {
    A1: "A1 – Débutant",
    A2: "A2 – Élémentaire",
    B1: "B1 – Intermédiaire",
    B2: "B2 – Avancé",
    C1: "C1 – Courant",
    C2: "C2 – Maîtrise",
    Native: "Langue maternelle",
};

interface LanguagesProps {
    data: LanguageItem[];
    onChange: (d: LanguageItem[]) => void;
}

export function LanguagesSection({ data, onChange }: LanguagesProps) {
    const add = () => onChange([...data, { id: crypto.randomUUID(), language: "", level: "B2" }]);
    const upd = (id: string, k: keyof LanguageItem, v: unknown) =>
        onChange(data.map((i) => (i.id === id ? { ...i, [k]: v } : i)));
    const del = (id: string) => onChange(data.filter((i) => i.id !== id));

    return (
        <div>
            {data.map((item) => (
                <div key={item.id} style={{ ...itemBox, display: "flex", flexDirection: "column", gap: "9px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                        <div style={{ flex: 1 }}>
                            <Label>Langue</Label>
                            <LanguagePicker value={item.language} onChange={(v) => upd(item.id, "language", v)} />
                        </div>
                        <div style={{ marginTop: "24px" }}>
                            <DeleteButton onClick={() => del(item.id)} />
                        </div>
                    </div>
                    <div>
                        <Label>Niveau</Label>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {LEVELS.map((l) => (
                                <button
                                    key={l}
                                    type="button"
                                    onClick={() => upd(item.id, "level", l)}
                                    style={{
                                        padding: "5px 10px",
                                        borderRadius: "7px",
                                        border: item.level === l ? "1.5px solid #16A34A" : "1.5px solid var(--gb-border)",
                                        background: item.level === l ? "rgba(22,163,74,0.1)" : "transparent",
                                        color: item.level === l ? "#16A34A" : "var(--gb-text-off)",
                                        fontSize: "11px",
                                        fontWeight: item.level === l ? 700 : 400,
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                    }}>
                                    {l}
                                </button>
                            ))}
                        </div>
                        {item.level && (
                            <p style={{ fontSize: "10.5px", color: "var(--gb-muted)", margin: "4px 0 0" }}>
                                {levelLabel[item.level]}
                            </p>
                        )}
                    </div>
                </div>
            ))}
            <AddButton label="Ajouter une langue" onClick={add} />
        </div>
    );
}