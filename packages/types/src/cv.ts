export const CV_TEMPLATE_IDS = [
    "modern-strategy",
    "academic",
    "creative",
    "minimalist",
    "tech",
    "international",
    "design-epure",
    "classic-reinvented",
    "skills-focus",
    "startup",
] as const;

export type CvTemplate = (typeof CV_TEMPLATE_IDS)[number];
export type CvTemplateCategory = "ats" | "fancy";
export type CvTemplateDomain =
    | "general"
    | "it"
    | "design"
    | "business"
    | "academic"
    | "healthcare"
    | "engineering"
    | "marketing"
    | "legal"
    | "finance";

export const CV_SECTION_TYPES = [
    "personal-info",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "languages",
    "certifications",
    "custom",
] as const;

export type CvSectionType = (typeof CV_SECTION_TYPES)[number];

export interface PersonalInfoData {
    firstName: string;
    lastName: string;
    roleTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
    photo?: string;
}

export interface ExperienceItem {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    location: string;
    description: string;
    highlights: string[];
}

export interface EducationItem {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa: string;
    description: string;
}

export interface SkillGroup {
    id: string;
    category: string;
    skills: string[];
}

export interface ProjectItem {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url: string;
    github: string;
}

export interface LanguageItem {
    id: string;
    language: string;
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Native";
}

export interface CertificationItem {
    id: string;
    name: string;
    issuer: string;
    date: string;
    url: string;
}

export interface CustomSectionData {
    title: string;
    content: string;
}

export type CvSection =
    | {
          type: "personal-info";
          order: number;
          label?: string;
          data: PersonalInfoData;
      }
    | {
          type: "summary";
          order: number;
          label?: string;
          data: { text: string };
      }
    | {
          type: "experience";
          order: number;
          label?: string;
          data: ExperienceItem[];
      }
    | {
          type: "education";
          order: number;
          label?: string;
          data: EducationItem[];
      }
    | {
          type: "skills";
          order: number;
          label?: string;
          data: SkillGroup[];
      }
    | {
          type: "projects";
          order: number;
          label?: string;
          data: ProjectItem[];
      }
    | {
          type: "languages";
          order: number;
          label?: string;
          data: LanguageItem[];
      }
    | {
          type: "certifications";
          order: number;
          label?: string;
          data: CertificationItem[];
      }
    | {
          type: "custom";
          order: number;
          label?: string;
          data: CustomSectionData;
      };

export interface ThemeSettings {
    templateColor?: string; 
    titleColor?: string; 
    titleFontFamily?: string;
    bodyFontFamily?: string;
    titleFontSize?: "small" | "medium" | "large";
    bodyFontSize?: "small" | "medium" | "large";
    accentColor?: string;
    fontFamily?: string;
    fontSize?: "small" | "medium" | "large";
}

export interface AtsScoreData {
    score: number;
    missingKeywords: string[];
    matchedKeywords: string[];
    suggestions: string[];
    strengths?: string[];
    weaknesses?: string[];
    tips?: string[];
    breakdown: {
        keywordMatch: number;
        formatting: number;
        completeness: number;
        relevance: number;
    };
}

export interface CvDTO {
    _id: string;
    userId: string;
    title: string;
    template: CvTemplate;
    theme?: ThemeSettings;
    sections: CvSection[];
    pdfUrl?: string;
    shareToken?: string;
    isPublic: boolean;
    atsScore?: number;
    createdAt: string;
    updatedAt: string;
}

export interface AtsScoreResult extends AtsScoreData {}

export interface SuggestionsResult {
    suggestions: Array<{
        section: string;
        issue: string;
        suggestion: string;
        priority: "high" | "medium" | "low";
    }>;
}

export interface EnhanceResult {
    enhanced: string;
}

export interface TailorResult {
    summary: string;
    suggestedSkills: string[];
    suggestedKeywords: string[];
}

export interface CoverLetterResult {
    content: string;
}

export interface ExtractResult {
    personalInfo: PersonalInfoData;
    summary: string;
    experience: Omit<ExperienceItem, "id" | "highlights">[];
    education: Omit<EducationItem, "id" | "current" | "description">[];
    skills: { category: string; skills: string[] }[];
    projects: Omit<ProjectItem, "id" | "github" | "url">[];
    languages: { language: string; level: string }[];
    certifications: Omit<CertificationItem, "id" | "url">[];
}
