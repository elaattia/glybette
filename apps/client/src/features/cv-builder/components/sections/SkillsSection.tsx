import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Input, AddButton, itemBox, delBtn } from "./primitives";
import type { SkillGroup } from "../../types/cv.types";

interface SkillsProps {
    data: SkillGroup[];
    onChange: (d: SkillGroup[]) => void;
}

export function SkillsSection({ data, onChange }: SkillsProps) {
    const [inputs, setInputs] = useState<Record<string, string>>({});

    const addGroup = () => onChange([...data, { id: crypto.randomUUID(), category: "", skills: [] }]);
    const updCategory = (id: string, v: string) => onChange(data.map((g) => (g.id === id ? { ...g, category: v } : g)));
    const addSkill = (groupId: string) => {
        const skill = inputs[groupId]?.trim();
        if (!skill) return;
        onChange(data.map((g) => (g.id === groupId ? { ...g, skills: [...g.skills, skill] } : g)));
        setInputs((p) => ({ ...p, [groupId]: "" }));
    };
    const removeSkill = (groupId: string, skill: string) =>
        onChange(data.map((g) => (g.id === groupId ? { ...g, skills: g.skills.filter((s) => s !== skill) } : g)));
    const removeGroup = (id: string) => onChange(data.filter((g) => g.id !== id));

    return (
        <div>
            {data.map((group) => (
                <div key={group.id} style={itemBox}>
                    <div style={{ display: "flex", gap: "7px", alignItems: "center", marginBottom: "9px" }}>
                        <Input
                            value={group.category}
                            placeholder="Catégorie (ex: Frontend, DevOps…)"
                            onChange={(e) => updCategory(group.id, e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button style={delBtn} onClick={() => removeGroup(group.id)}>
                            <Trash2 style={{ width: 13, height: 13 }} />
                        </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "7px" }}>
                        {group.skills.map((skill) => (
                            <span key={skill} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "99px", padding: "3px 9px", fontSize: "12px", color: "var(--gb-text-off)" }}>
                                {skill}
                                <button onClick={() => removeSkill(group.id, skill)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gb-muted)", padding: 0, lineHeight: 1, fontSize: "14px", display: "flex", alignItems: "center" }}>×</button>
                            </span>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                        <Input
                            value={inputs[group.id] ?? ""}
                            placeholder="Ajouter… (Entrée pour valider)"
                            onChange={(e) => setInputs((p) => ({ ...p, [group.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(group.id); } }}
                            style={{ flex: 1, fontSize: "12px" }}
                        />
                        <button onClick={() => addSkill(group.id)} style={{ background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "9px", padding: "0 12px", cursor: "pointer", color: "var(--gb-text-off)", fontSize: "12px", flexShrink: 0 }}>
                            + Add
                        </button>
                    </div>
                </div>
            ))}
            <AddButton label="Ajouter une catégorie" onClick={addGroup} />
        </div>
    );
}