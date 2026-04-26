export type {
    CvTemplate,
    CvTemplateCategory,
    CvTemplateDomain,
    CvSectionType,
    CvSection,
    CvDTO,
    PersonalInfoData,
    ExperienceItem,
    EducationItem,
    SkillGroup,
    ProjectItem,
    LanguageItem,
    CertificationItem,
    CustomSectionData,
    AtsScoreResult,
    SuggestionsResult,
    EnhanceResult,
    TailorResult,
    CoverLetterResult,
    ExtractResult,
} from "@glybette/types";

import type { CvTemplate, CvTemplateCategory, CvTemplateDomain } from "@glybette/types";

export interface TemplateInfo {
    id: CvTemplate;
    name: string;
    category: CvTemplateCategory;
    domains: CvTemplateDomain[];
    isAtsReady: boolean;
    previewBg: string;
    accentColor: string;
    description: string;
}

import type { CvSection } from "@glybette/types";

export interface CvEditorState {
    id?: string;
    title: string;
    template: CvTemplate;
    sections: CvSection[];
    isDirty: boolean;
    isSaving: boolean;
    lastSaved?: Date;
    atsScore?: number;
    pdfUrl?: string;
    shareToken?: string;
    isPublic?: boolean;
}

export type EditorView = "edit" | "preview";
