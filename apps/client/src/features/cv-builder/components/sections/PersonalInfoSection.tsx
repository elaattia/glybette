import { useLocale } from "@/hooks/useLocale";
import { Input, Field, grid2 } from "./primitives";
import { LocationPicker } from "./inputs/LocationPicker";
import type { PersonalInfoData } from "../../types/cv.types";

interface PersonalInfoProps {
    data: PersonalInfoData;
    onChange: (d: PersonalInfoData) => void;
}

export function PersonalInfoSection({ data, onChange }: PersonalInfoProps) {
    const { t } = useLocale("cvBuilder");
    const set = (k: keyof PersonalInfoData) => (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange({ ...data, [k]: e.target.value });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            <Field label={t("sections.personalInfo.photo")}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {data.photo ? <img src={data.photo} alt={t("sections.personalInfo.profileAlt")} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "20px", color: "var(--gb-muted)" }}>👤</span>}
                    </div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--gb-text)", cursor: "pointer", background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)", padding: "5px 10px", borderRadius: "6px" }}>
                        {t("sections.personalInfo.import")}
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
                            {t("sections.personalInfo.remove")}
                        </button>
                    )}
                </div>
            </Field>
            <div style={grid2}>
                <Field label={t("sections.personalInfo.firstName")}>
                    <Input placeholder={t("sections.personalInfo.placeholders.firstName")} value={data.firstName} onChange={set("firstName")} />
                </Field>
                <Field label={t("sections.personalInfo.lastName")}>
                    <Input placeholder={t("sections.personalInfo.placeholders.lastName")} value={data.lastName} onChange={set("lastName")} />
                </Field>
            </div>
            <Field label={t("sections.personalInfo.roleTitle")}>
                <Input placeholder={t("sections.personalInfo.placeholders.roleTitle")} value={data.roleTitle} onChange={set("roleTitle")} />
            </Field>
            <div style={grid2}>
                <Field label={t("sections.personalInfo.email")}>
                    <Input type="email" placeholder={t("sections.personalInfo.placeholders.email")} value={data.email} onChange={set("email")} />
                </Field>
                <Field label={t("sections.personalInfo.phone")}>
                    <Input placeholder={t("sections.personalInfo.placeholders.phone")} value={data.phone} onChange={set("phone")} />
                </Field>
            </div>
            <Field label={t("sections.personalInfo.location")}>
                <LocationPicker value={data.location} onChange={(val) => onChange({ ...data, location: val })} />
            </Field>
            <div style={grid2}>
                <Field label={t("sections.personalInfo.linkedin")}>
                    <Input placeholder={t("sections.personalInfo.placeholders.linkedin")} value={data.linkedin} onChange={set("linkedin")} />
                </Field>
                <Field label={t("sections.personalInfo.github")}>
                    <Input placeholder={t("sections.personalInfo.placeholders.github")} value={data.github} onChange={set("github")} />
                </Field>
            </div>
            <Field label={t("sections.personalInfo.portfolio")}>
                <Input placeholder={t("sections.personalInfo.placeholders.portfolio")} value={data.portfolio} onChange={set("portfolio")} />
            </Field>
        </div>
    );
}
