import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GraduationCap, Award, Briefcase } from "lucide-react";
import type { JourneyPayload, JourneyType } from "@glybette/types";
import { cn } from "@/lib/utils";
import { StepFooter } from "./StepFooter";

const OPTIONS: {
    value: JourneyType;
    key: "student" | "graduate" | "jobSeeker";
    icon: React.ReactNode;
    iconBgVar: string;
    iconColorVar: string;
}[] = [
    {
        value: "Student",
        key: "student",
        icon: <GraduationCap className="w-8 h-8" />,
        iconBgVar: "var(--ob-icon-bg-green)",
        iconColorVar: "var(--ob-icon-green)",
    },
    {
        value: "Graduate",
        key: "graduate",
        icon: <Award className="w-8 h-8" />,
        iconBgVar: "var(--ob-icon-bg-blue)",
        iconColorVar: "var(--ob-icon-blue)",
    },
    {
        value: "Job Seeker",
        key: "jobSeeker",
        icon: <Briefcase className="w-8 h-8" />,
        iconBgVar: "var(--ob-icon-bg-teal)",
        iconColorVar: "var(--ob-icon-teal)",
    },
];

interface Props {
    onNext: (data: JourneyPayload) => void;
    onSkip: () => void;
}

export function StepJourney({ onNext, onSkip }: Props) {
    const { t } = useTranslation("onboarding");
    const [selected, setSelected] = useState<JourneyType | null>(null);

    return (
        <div>
            <div className="ob-step-head">
                <div className="gb-sec-label justify-center w-full">{t("journey.label")}</div>
                <h1 className="ob-step-title">{t("journey.title")}</h1>
                <p className="ob-step-sub">{t("journey.subtitle")}</p>
            </div>

            <div className="ob-journey-grid">
                {OPTIONS.map((option) => {
                    const isSelected = selected === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setSelected(option.value)}
                            className={cn("ob-journey-card", isSelected && "ob-journey-card--selected")}>
                            <div
                                className="ob-journey-icon-wrap"
                                style={{ background: option.iconBgVar, color: option.iconColorVar }}>
                                {option.icon}
                            </div>
                            <p className="ob-journey-card-title">{t(`journey.options.${option.key}.title`)}</p>
                            <p className="ob-journey-card-desc">{t(`journey.options.${option.key}.description`)}</p>
                        </button>
                    );
                })}
            </div>

            <StepFooter
                onSkip={onSkip}
                onContinue={() => selected && onNext({ journey: selected })}
                canContinue={!!selected}
            />
        </div>
    );
}
