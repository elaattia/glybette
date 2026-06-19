import type {
    PersonalInfoData, ExperienceItem, EducationItem,
    SkillGroup, ProjectItem, LanguageItem, CertificationItem,
} from "../../../types/cv.types";
import { useLocale } from "@/hooks/useLocale";

export interface TemplateProps {
    personal: PersonalInfoData | null;
    summary: { text: string } | null;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillGroup[];
    projects: ProjectItem[];
    languages: LanguageItem[];
    certs: CertificationItem[];
    accent: string;
    bg: string;
    photo?: string | null;
}

export function EmptyState() {
    const { t } = useLocale("cvBuilder");
    return (
        <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#bbb",
            fontSize: "13px",
        }}>
            {t("editor.previewEmpty")}
        </div>
    );
}

export function Avatar({
    photo, firstName, lastName, size = 72, accent,
}: {
    photo?: string | null;
    firstName?: string;
    lastName?: string;
    size?: number;
    accent: string;
    bg: string;
}) {
    const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

    if (photo) {
        return (
            <img
                src={photo}
                alt="photo"
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `3px solid ${accent}`,
                    display: "block",
                }}
            />
        );
    }

    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: `rgba(255,255,255,0.18)`,
            border: `3px solid rgba(255,255,255,0.35)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.34,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
            letterSpacing: "1px",
        }}>
            {initials || "?"}
        </div>
    );
}

export function ModernSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div className="cv-section" style={{ marginBottom: "15px", pageBreakInside: "avoid" }}>
            <div style={{
                fontSize: `calc(8pt * var(--cv-body-scale, 1))`, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px",
                color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: "4px", marginBottom: "10px",
            }}>
                {title}
            </div>
            {children}
        </div>
    );
}

export function MinSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div className="cv-section" style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
            <div style={{
                fontSize: `calc(7.5pt * var(--cv-body-scale, 1))`, fontWeight: 700, letterSpacing: "2.5px",
                color: accent, marginBottom: "8px", textTransform: "uppercase",
            }}>
                {title}
            </div>
            {children}
        </div>
    );
}

export function TechSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div className="cv-section" style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
            <div style={{
                fontSize: `calc(8pt * var(--cv-body-scale, 1))`, fontWeight: 700, color: accent,
                fontFamily: "'Courier New', monospace", marginBottom: "8px",
            }}>
                {title}
            </div>
            {children}
        </div>
    );
}

export function AcadSection({ title, accent, bg, children }: { title: string; accent: string; bg: string; children: React.ReactNode }) {
    return (
        <div className="cv-section" style={{ marginBottom: "18px", pageBreakInside: "avoid" }}>
            <h2 style={{
                fontSize: `calc(10.5pt * var(--cv-body-scale, 1))`, fontWeight: 700, fontVariant: "small-caps",
                color: bg, borderBottom: `1.5px solid ${accent}55`,
                paddingBottom: "5px", marginBottom: "10px", margin: "0 0 10px",
            }}>
                {title}
            </h2>
            {children}
        </div>
    );
}

export function CreatSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div className="cv-section" style={{ marginBottom: "16px", pageBreakInside: "avoid" }}>
            <h2 style={{
                fontSize: `calc(9pt * var(--cv-body-scale, 1))`, fontWeight: 700, color: accent,
                textTransform: "uppercase", letterSpacing: "1px",
                marginBottom: "8px", borderBottom: `1px solid ${accent}30`,
                paddingBottom: "4px",
            }}>
                {title}
            </h2>
            {children}
        </div>
    );
}

export function ClassicSection({ title, accent, bg, children }: { title: string; accent: string; bg: string; children: React.ReactNode }) {
    return (
        <div className="cv-section" style={{ marginBottom: "16px", pageBreakInside: "avoid" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "9px" }}>
                <div style={{ width: "3px", height: "16px", background: accent, borderRadius: "2px" }} />
                <span style={{
                    fontSize: `calc(9pt * var(--cv-body-scale, 1))`, fontWeight: 700, color: bg,
                    textTransform: "uppercase", letterSpacing: "0.8px",
                }}>
                    {title}
                </span>
            </div>
            {children}
        </div>
    );
}