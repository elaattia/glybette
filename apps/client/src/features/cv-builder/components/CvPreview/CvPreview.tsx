import { useEffect, useRef, useState } from "react";
import type { CvSection, CvTemplate, CvEditorState } from "../../types/cv.types";
import type {
    PersonalInfoData, ExperienceItem, EducationItem,
    SkillGroup, ProjectItem, LanguageItem, CertificationItem,
} from "../../types/cv.types";
import { getTemplate } from "../../templates";
import { ElegantTemplate } from "./templates/ElegantTemplate";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";
import { ImpactTemplate } from "./templates/ImpactTemplate";
import { TechTemplate } from "./templates/TechTemplate";
import { ClassiqueTemplate } from "./templates/ClassiqueTemplate";
import type { TemplateProps } from "./templates/TemplateSection";

interface CvPreviewProps {
    template: CvTemplate;
    theme?: CvEditorState["theme"];
    sections: CvSection[];
}

export function CvPreview({ template, theme, sections }: CvPreviewProps) {
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

    const personalRaw = get<PersonalInfoData>("personal-info");

    const data: TemplateProps = {
        personal: personalRaw,
        summary: get<{ text: string }>("summary"),
        experience: get<ExperienceItem[]>("experience") ?? [],
        education: get<EducationItem[]>("education") ?? [],
        skills: get<SkillGroup[]>("skills") ?? [],
        projects: get<ProjectItem[]>("projects") ?? [],
        languages: get<LanguageItem[]>("languages") ?? [],
        certs: get<CertificationItem[]>("certifications") ?? [],
        accent: theme?.titleColor ?? theme?.accentColor ?? tpl.accentColor,
        bg: theme?.templateColor ?? tpl.previewBg,
        photo: (personalRaw as any)?.photo ?? null,
    };

    const titleSizeMultiplier = theme?.titleFontSize === "small" ? 0.85 : theme?.titleFontSize === "large" ? 1.15 : 1;
    const bodySizeMultiplier = theme?.bodyFontSize === "small" ? 0.85 : theme?.bodyFontSize === "large" ? 1.15 : 1;

    const customStyles = { 
        fontFamily: theme?.bodyFontFamily ?? theme?.fontFamily ?? "inherit",
        "--cv-title-font": theme?.titleFontFamily ?? theme?.fontFamily ?? "inherit",
        "--cv-body-scale": bodySizeMultiplier,
        "--cv-title-scale": titleSizeMultiplier,
    } as React.CSSProperties;

    const renderTemplate = () => {
        switch (template) {
            case "creative":       return <ElegantTemplate {...data} />;
            case "minimalist":    return <MinimalistTemplate {...data} />;
            case "modern-strategy":        return <ImpactTemplate {...data} />;
            case "tech":          return <TechTemplate {...data} />;
            case "classic-reinvented":     return <ClassiqueTemplate {...data} />;
            default:              return <ElegantTemplate {...data} />;
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                padding: "24px",
                background: "#f3f4f6",
                minHeight: "100vh",
                overflowX: "hidden",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    width: "210mm",
                    minHeight: "297mm",
                    transform: `scale(${scale})`,
                    transformOrigin: "top center",
                    marginBottom: `calc(-297mm * ${1 - scale})`,
                }}
            >
                <div
                    id="cv-pdf-content"
                    style={{
                        width: "210mm",
                        minHeight: "297mm",
                        background: "#fff",
                        boxShadow: "0 4px 25px rgba(0,0,0,0.12)",
                        borderRadius: "4px",
                        margin: "0 auto",
                        overflow: "hidden",
                        ...customStyles
                    }}
                >
                    <style>
                        {`
                        #cv-pdf-content h1, #cv-pdf-content h2, #cv-pdf-content h3,
                        #cv-pdf-content .cv-section > div:first-child,
                        #cv-pdf-content .cv-section > h2 {
                            font-family: var(--cv-title-font) !important;
                            --cv-body-scale: var(--cv-title-scale) !important;
                        }
                        `}
                    </style>
                    {renderTemplate()}
                </div>
            </div>
        </div>
    );
}