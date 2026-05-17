import { useState } from "react";
import { FolderKanban } from "lucide-react";
import { Input, Textarea, Label, Field, AddButton, DeleteButton, itemBox, grid2 } from "./primitives";
import type { ProjectItem } from "../../types/cv.types";

interface ProjectsProps {
    data: ProjectItem[];
    onChange: (d: ProjectItem[]) => void;
}

export function ProjectsSection({ data, onChange }: ProjectsProps) {
    const [techInputs, setTechInputs] = useState<Record<string, string>>({});

    const add = () => onChange([...data, { id: crypto.randomUUID(), name: "", description: "", technologies: [], url: "", github: "" }]);
    const upd = (id: string, k: keyof ProjectItem, v: unknown) => onChange(data.map((i) => (i.id === id ? { ...i, [k]: v } : i)));
    const del = (id: string) => onChange(data.filter((i) => i.id !== id));

    const addTech = (id: string) => {
        const tech = techInputs[id]?.trim();
        if (!tech) return;
        const item = data.find((i) => i.id === id);
        if (!item) return;
        upd(id, "technologies", [...item.technologies, tech]);
        setTechInputs((p) => ({ ...p, [id]: "" }));
    };
    const removeTech = (id: string, tech: string) => {
        const item = data.find((i) => i.id === id);
        if (!item) return;
        upd(id, "technologies", item.technologies.filter((t) => t !== tech));
    };

    return (
        <div>
            {data.map((item, idx) => (
                <div key={item.id} style={itemBox}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "11px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <FolderKanban style={{ width: 13, height: 13, color: "#16A34A" }} />
                            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--gb-muted)" }}>Projet {idx + 1}</span>
                        </div>
                        <DeleteButton onClick={() => del(item.id)} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                        <Field label="Nom du projet">
                            <Input value={item.name} placeholder="Nom du projet" onChange={(e) => upd(item.id, "name", e.target.value)} />
                        </Field>
                        <Field label="Description">
                            <Textarea value={item.description} placeholder="Décrivez le projet, son impact et vos contributions…" onChange={(e) => upd(item.id, "description", e.target.value)} />
                        </Field>
                        <div style={grid2}>
                            <Field label="URL">
                                <Input value={item.url} placeholder="https://example.com" onChange={(e) => upd(item.id, "url", e.target.value)} />
                            </Field>
                            <Field label="GitHub">
                                <Input value={item.github} placeholder="github.com/user/repo" onChange={(e) => upd(item.id, "github", e.target.value)} />
                            </Field>
                        </div>
                        <div>
                            <Label>Technologies</Label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "7px" }}>
                                {item.technologies.map((tech) => (
                                    <span key={tech} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(2,132,199,0.1)", border: "1px solid rgba(2,132,199,0.25)", borderRadius: "99px", padding: "3px 9px", fontSize: "11px", color: "#0284C7" }}>
                                        {tech}
                                        <button onClick={() => removeTech(item.id, tech)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0284C7", padding: 0, lineHeight: 1, fontSize: "13px" }}>×</button>
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                                <Input
                                    value={techInputs[item.id] ?? ""}
                                    placeholder="React, TypeScript… (Entrée)"
                                    onChange={(e) => setTechInputs((p) => ({ ...p, [item.id]: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(item.id); } }}
                                    style={{ flex: 1, fontSize: "12px" }}
                                />
                                <button onClick={() => addTech(item.id)} style={{ background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "9px", padding: "0 12px", cursor: "pointer", color: "var(--gb-text-off)", fontSize: "12px", flexShrink: 0 }}>+ Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <AddButton label="Ajouter un projet" onClick={add} />
        </div>
    );
}