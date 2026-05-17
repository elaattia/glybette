import {
    User, AlignLeft, Briefcase, GraduationCap,
    Code2, FolderKanban, Languages, Award,
} from "lucide-react";
import type { CvSection, CvSectionType } from "../../types/cv.types";

export const SECTION_DEFS: {
    type: CvSectionType;
    label: string;
    icon: React.ReactNode;
    defaultData: CvSection["data"];
}[] = [
    {
        type: "personal-info",
        label: "Contact",
        icon: <User style={{ width: 14, height: 14 }} />,
        defaultData: {
            firstName: "", lastName: "", roleTitle: "",
            email: "", phone: "", location: "",
            linkedin: "", github: "", portfolio: "",
        },
    },
    {
        type: "summary",
        label: "Résumé",
        icon: <AlignLeft style={{ width: 14, height: 14 }} />,
        defaultData: { text: "" },
    },
    {
        type: "experience",
        label: "Expérience",
        icon: <Briefcase style={{ width: 14, height: 14 }} />,
        defaultData: [],
    },
    {
        type: "education",
        label: "Formation",
        icon: <GraduationCap style={{ width: 14, height: 14 }} />,
        defaultData: [],
    },
    {
        type: "skills",
        label: "Compétences",
        icon: <Code2 style={{ width: 14, height: 14 }} />,
        defaultData: [],
    },
    {
        type: "projects",
        label: "Projets",
        icon: <FolderKanban style={{ width: 14, height: 14 }} />,
        defaultData: [],
    },
    {
        type: "languages",
        label: "Langues",
        icon: <Languages style={{ width: 14, height: 14 }} />,
        defaultData: [],
    },
    {
        type: "certifications",
        label: "Certifications",
        icon: <Award style={{ width: 14, height: 14 }} />,
        defaultData: [],
    },
];