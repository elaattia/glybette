import { Input, Field, grid2 } from "./primitives";
import { LocationPicker } from "./inputs/LocationPicker";
import type { PersonalInfoData } from "../../types/cv.types";

interface PersonalInfoProps {
    data: PersonalInfoData;
    onChange: (d: PersonalInfoData) => void;
}

export function PersonalInfoSection({ data, onChange }: PersonalInfoProps) {
    const set = (k: keyof PersonalInfoData) => (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange({ ...data, [k]: e.target.value });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            <Field label="Photo de profil">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {data.photo ? <img src={data.photo} alt="Profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "20px", color: "var(--gb-muted)" }}>👤</span>}
                    </div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--gb-text)", cursor: "pointer", background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)", padding: "5px 10px", borderRadius: "6px" }}>
                        Importer
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => onChange({ ...data, photo: ev.target?.result as string });
                                reader.readAsDataURL(file);
                            }}
                        />
                    </label>
                    {data.photo && (
                        <button onClick={() => onChange({ ...data, photo: undefined })} style={{ border: "none", background: "none", color: "#dc2626", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}>
                            Supprimer
                        </button>
                    )}
                </div>
            </Field>
            <div style={grid2}>
                <Field label="Prénom">
                    <Input placeholder="Alex" value={data.firstName} onChange={set("firstName")} />
                </Field>
                <Field label="Nom">
                    <Input placeholder="Johnson" value={data.lastName} onChange={set("lastName")} />
                </Field>
            </div>
            <Field label="Titre / Poste visé">
                <Input placeholder="Product Designer" value={data.roleTitle} onChange={set("roleTitle")} />
            </Field>
            <div style={grid2}>
                <Field label="Email">
                    <Input type="email" placeholder="alex@example.com" value={data.email} onChange={set("email")} />
                </Field>
                <Field label="Téléphone">
                    <Input placeholder="+216 XX XXX XXX" value={data.phone} onChange={set("phone")} />
                </Field>
            </div>
            <Field label="Localisation">
                <LocationPicker value={data.location} onChange={(val) => onChange({ ...data, location: val })} />
            </Field>
            <div style={grid2}>
                <Field label="LinkedIn">
                    <Input placeholder="linkedin.com/in/alex" value={data.linkedin} onChange={set("linkedin")} />
                </Field>
                <Field label="GitHub">
                    <Input placeholder="github.com/alex" value={data.github} onChange={set("github")} />
                </Field>
            </div>
            <Field label="Site web / Portfolio">
                <Input placeholder="alexjohnson.dev" value={data.portfolio} onChange={set("portfolio")} />
            </Field>
        </div>
    );
}