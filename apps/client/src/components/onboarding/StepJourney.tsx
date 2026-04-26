import { useState } from "react";
import { GraduationCap, Award, Briefcase } from "lucide-react";
import type { JourneyPayload, JourneyType } from "@glybette/types";
import { cn } from "@/lib/utils";
import { StepFooter } from "./StepFooter";

const OPTIONS: {
    value: JourneyType;
    icon: React.ReactNode;
    title: string;
    description: string;
    iconBgVar: string;
    iconColorVar: string;
}[] = [
    {
        value: "Student",
        icon: <GraduationCap className="w-8 h-8" />,
        title: "Student",
        description: "Currently enrolled in an academic program or course.",
        iconBgVar: "var(--ob-icon-bg-green)",
        iconColorVar: "var(--ob-icon-green)",
    },
    {
        value: "Graduate",
        icon: <Award className="w-8 h-8" />,
        title: "Graduate",
        description: "Recently finished studies and ready for the next chapter.",
        iconBgVar: "var(--ob-icon-bg-blue)",
        iconColorVar: "var(--ob-icon-blue)",
    },
    {
        value: "Job Seeker",
        icon: <Briefcase className="w-8 h-8" />,
        title: "Job Seeker",
        description: "Actively looking for new professional opportunities.",
        iconBgVar: "var(--ob-icon-bg-teal)",
        iconColorVar: "var(--ob-icon-teal)",
    },
];

interface Props {
    onNext: (data: JourneyPayload) => void;
    onSkip: () => void;
}

export function StepJourney({ onNext, onSkip }: Props) {
    const [selected, setSelected] = useState<JourneyType | null>(null);

    return (
        <div>
            <div className="ob-step-head">
                <div className="gb-sec-label justify-center w-full">Your Journey</div>
                <h1 className="ob-step-title">Where are you in your journey?</h1>
                <p className="ob-step-sub">
                    Select the option that best describes your current professional or academic standing.
                </p>
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
                            <p className="ob-journey-card-title">{option.title}</p>
                            <p className="ob-journey-card-desc">{option.description}</p>
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
