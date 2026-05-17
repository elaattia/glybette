import { useEffect, useRef, useState } from "react";
import type { CvSection, CvTemplate } from "../../types/cv.types";
import type {
    PersonalInfoData, ExperienceItem, EducationItem,
    SkillGroup, ProjectItem, LanguageItem, CertificationItem,
} from "../../types/cv.types";
import { getTemplate } from "../../templates";
import { ModernTemplate } from "./templates/ModernTemplate";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";
import { TechTemplate } from "./templates/TechTemplate";
import { AcademicTemplate, CreativeTemplate, ClassicTemplate } from "./templates/Othertemplates";
import type { TemplateProps } from "./templates/TemplateSection";

interface CvPreviewProps {
    template: CvTemplate;
    sections: CvSection[];
}

export function CvPreview({ template, sections }: CvPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const obs = new ResizeObserver((entries) => {
            if (entries[0]) {
                const w = entries[0].contentRect.width;
                const targetW = 794;
                setScale(w < targetW ? w / targetW : 1);
            }
        });
        if (containerRef.current) obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, []);

    const tpl = getTemplate(template);
    const sorted = [...sections].sort((a, b) => a.order - b.order);

    const get = <T,>(type: string): T | null =>
        (sorted.find((s) => s.type === type)?.data as T) ?? null;

    const data: TemplateProps = {
        personal: get<PersonalInfoData>("personal-info"),
        summary: get<{ text: string }>("summary"),
        experience: get<ExperienceItem[]>("experience") ?? [],
        education: get<EducationItem[]>("education") ?? [],
        skills: get<SkillGroup[]>("skills") ?? [],
        projects: get<ProjectItem[]>("projects") ?? [],
        languages: get<LanguageItem[]>("languages") ?? [],
        certs: get<CertificationItem[]>("certifications") ?? [],
        accent: tpl.accentColor,
        bg: tpl.previewBg,
    };

    const renderTemplate = () => {
        switch (template) {
            case "minimalist":       return <MinimalistTemplate {...data} />;
            case "tech":             return <TechTemplate {...data} />;
            case "academic":         return <AcademicTemplate {...data} />;
            case "creative":         return <CreativeTemplate {...data} />;
            case "classic-reinvented": return <ClassicTemplate {...data} />;
            default:                 return <ModernTemplate {...data} />;
        }
    };

    return (
        <div
            ref={containerRef}
            style={{ padding: "24px", background: "#f3f4f6", minHeight: "100vh", overflowX: "hidden", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
                style={{ width: "210mm", minHeight: "297mm", transform: `scale(${scale})`, transformOrigin: "top center", marginBottom: `calc(-297mm * ${1 - scale})` }}>
                <div
                    id="cv-pdf-content"
                    style={{ width: "210mm", minHeight: "297mm", background: data.bg, boxShadow: "0 4px 25px rgba(0,0,0,0.12)", borderRadius: "6px", margin: "0 auto" }}>
                    {renderTemplate()}
                </div>
            </div>
        </div>
    );
}