import {
    User, AlignLeft, Briefcase, GraduationCap,
    Code2, FolderKanban, Languages, Award,
} from "lucide-react";
import { useMemo } from "react";
import { useLocale } from "@/hooks/useLocale";
import { buildSectionDefs, type SectionDef } from "../../lib/cv-i18n";
import type { CvSectionType } from "../../types/cv.types";

const SECTION_ICONS: Record<CvSectionType, React.ReactNode> = {
    "personal-info": <User style={{ width: 14, height: 14 }} />,
    summary: <AlignLeft style={{ width: 14, height: 14 }} />,
    experience: <Briefcase style={{ width: 14, height: 14 }} />,
    education: <GraduationCap style={{ width: 14, height: 14 }} />,
    skills: <Code2 style={{ width: 14, height: 14 }} />,
    projects: <FolderKanban style={{ width: 14, height: 14 }} />,
    languages: <Languages style={{ width: 14, height: 14 }} />,
    certifications: <Award style={{ width: 14, height: 14 }} />,
    custom: null,
};

export function useSectionDefs(): SectionDef[] {
    const { t } = useLocale("cvBuilder");
    return useMemo(() => buildSectionDefs(t, SECTION_ICONS), [t]);
}
