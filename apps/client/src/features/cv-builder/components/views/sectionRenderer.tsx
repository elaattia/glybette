import type { CvSection } from "../../types/cv.types";
import type { ExperienceItem } from "../../types/cv.types";
import type { CustomSectionDataV2 } from "../sections";
import {
    PersonalInfoSection,
    SummarySection,
    ExperienceSection,
    EducationSection,
    SkillsSection,
    ProjectsSection,
    LanguagesSection,
    CertificationsSection,
    CustomSectionEditor,
} from "../sections";


export function renderSectionContent(
    sectionDef: { type: string; label?: string },
    sections: CvSection[],
    editor: { updateSection: (type: string, data: unknown) => void },
    ai: {
        enhancingKey: string | null;
        enhanceSection: (text: string, context: string, key: string) => Promise<string | null>;
    },
): React.ReactNode {
    const { type } = sectionDef;
    const s = sections.find((sec) => sec.type === type);
    if (!s) return null;

    switch (s.type) {
        case "personal-info":
            return (
                <PersonalInfoSection
                    data={s.data}
                    onChange={(d) => editor.updateSection(type, d)}
                />
            );

        case "summary":
            return (
                <SummarySection
                    data={s.data}
                    onChange={(d) => editor.updateSection(type, d)}
                    isEnhancing={ai.enhancingKey === "summary"}
                    onAiEnhance={async () => {
                        const enhanced = await ai.enhanceSection(s.data.text, "summary", "summary");
                        if (enhanced) editor.updateSection(type, { text: enhanced });
                    }}
                />
            );

        case "experience":
            return (
                <ExperienceSection
                    data={s.data}
                    onChange={(d) => editor.updateSection(type, d)}
                    enhancingKey={ai.enhancingKey}
                    onAiEnhance={async (itemId, currentText) => {
                        const key = `exp-${itemId}`;
                        const enhanced = await ai.enhanceSection(currentText, "experience description", key);
                        if (enhanced) {
                            const updated = (s.data as ExperienceItem[]).map((item) =>
                                item.id === itemId ? { ...item, description: enhanced } : item,
                            );
                            editor.updateSection(type, updated);
                        }
                    }}
                />
            );

        case "education":
            return (
                <EducationSection
                    data={s.data}
                    onChange={(d) => editor.updateSection(type, d)}
                />
            );

        case "skills":
            return (
                <SkillsSection
                    data={s.data}
                    onChange={(d) => editor.updateSection(type, d)}
                />
            );

        case "projects":
            return (
                <ProjectsSection
                    data={s.data}
                    onChange={(d) => editor.updateSection(type, d)}
                />
            );

        case "languages":
            return (
                <LanguagesSection
                    data={s.data}
                    onChange={(d) => editor.updateSection(type, d)}
                />
            );

        case "certifications":
            return (
                <CertificationsSection
                    data={s.data}
                    onChange={(d) => editor.updateSection(type, d)}
                />
            );

        case "custom": {
            const raw = s.data as unknown as Record<string, unknown>;
            const d: CustomSectionDataV2 =
                raw.fields && Array.isArray(raw.fields)
                    ? (raw as unknown as CustomSectionDataV2)
                    : {
                          title: (raw.title as string) ?? sectionDef.label ?? "",
                          fields: raw.content
                              ? [{ id: "legacy-1", type: "textarea" as const, label: "Contenu", value: raw.content as string }]
                              : [],
                      };
            return (
                <CustomSectionEditor
                    data={d}
                    onChange={(newData: CustomSectionDataV2) => editor.updateSection(type, newData as never)}
                />
            );
        }

        default:
            return (
                <p style={{ fontSize: "12px", color: "var(--gb-muted)", fontStyle: "italic" }}>
                    Section non reconnue.
                </p>
            );
    }
}