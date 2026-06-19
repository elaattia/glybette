import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, Briefcase, Globe, Zap, Sparkles, GraduationCap } from "lucide-react";
import type { LookingForPayload, OpportunityType } from "@glybette/types";
import { cn } from "@/lib/utils";
import { StepFooter } from "./StepFooter";

const OPTIONS: {
    value: OpportunityType;
    key: "internship" | "pfe" | "job" | "remote" | "freelance" | "other";
    icon: React.ReactNode;
    iconBgVar: string;
    iconColorVar: string;
}[] = [
    {
        value: "Internship",
        key: "internship",
        icon: <GraduationCap className="w-5 h-5" />,
        iconBgVar: "var(--ob-icon-bg-green)",
        iconColorVar: "var(--ob-icon-green)",
    },
    {
        value: "PFE",
        key: "pfe",
        icon: <BookOpen className="w-5 h-5" />,
        iconBgVar: "var(--ob-icon-bg-blue)",
        iconColorVar: "var(--ob-icon-blue)",
    },
    {
        value: "Job",
        key: "job",
        icon: <Briefcase className="w-5 h-5" />,
        iconBgVar: "var(--ob-icon-bg-yellow)",
        iconColorVar: "var(--ob-icon-yellow)",
    },
    {
        value: "Remote",
        key: "remote",
        icon: <Globe className="w-5 h-5" />,
        iconBgVar: "var(--ob-icon-bg-teal)",
        iconColorVar: "var(--ob-icon-teal)",
    },
    {
        value: "Freelance",
        key: "freelance",
        icon: <Zap className="w-5 h-5" />,
        iconBgVar: "var(--ob-icon-bg-purple)",
        iconColorVar: "var(--ob-icon-purple)",
    },
    {
        value: "Other",
        key: "other",
        icon: <Sparkles className="w-5 h-5" />,
        iconBgVar: "var(--ob-icon-bg-red)",
        iconColorVar: "var(--ob-icon-red)",
    },
];

interface Props {
    onNext: (data: LookingForPayload) => void;
    onSkip: () => void;
}

export function StepLookingFor({ onNext, onSkip }: Props) {
    const { t } = useTranslation("onboarding");
    const [selected, setSelected] = useState<OpportunityType[]>([]);

    function toggle(value: OpportunityType) {
        setSelected((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]));
    }

    return (
        <div>
            <div className="ob-step-head ob-step-head--tight">
                <div className="gb-sec-label justify-center w-full">{t("lookingFor.label")}</div>
                <h1 className="ob-step-title">{t("lookingFor.title")}</h1>
                <p className="ob-step-sub">{t("lookingFor.subtitle")}</p>
            </div>

            <div className="ob-looking-grid">
                {OPTIONS.map((option) => {
                    const isSelected = selected.includes(option.value);
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => toggle(option.value)}
                            className={cn("ob-looking-row", isSelected && "ob-looking-row--selected")}>
                            <div
                                className="ob-looking-icon-wrap"
                                style={{ background: option.iconBgVar, color: option.iconColorVar }}>
                                {option.icon}
                            </div>

                            <div className="ob-looking-text">
                                <p className="ob-looking-title">{t(`lookingFor.options.${option.key}.title`)}</p>
                                <p className="ob-looking-desc">{t(`lookingFor.options.${option.key}.description`)}</p>
                            </div>

                            <div className="ob-looking-check" aria-hidden>
                                {isSelected && (
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <StepFooter
                onSkip={onSkip}
                onContinue={() => onNext({ opportunities: selected })}
                canContinue={selected.length > 0}
            />
        </div>
    );
}
