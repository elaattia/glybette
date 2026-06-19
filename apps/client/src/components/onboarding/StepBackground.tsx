import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Monitor, Building2, Stethoscope, BarChart3, Palette, Sparkles } from "lucide-react";
import type { BackgroundPayload, Domain } from "@glybette/types";
import { cn } from "@/lib/utils";
import { StepFooter } from "./StepFooter";

const OPTIONS: {
    value: Domain;
    key: "it" | "architecture" | "medicine" | "business" | "design" | "other";
    icon: React.ReactNode;
    iconBgVar: string;
    iconColorVar: string;
}[] = [
    {
        value: "IT",
        key: "it",
        icon: <Monitor className="w-7 h-7" />,
        iconBgVar: "var(--ob-icon-bg-blue)",
        iconColorVar: "var(--ob-icon-blue)",
    },
    {
        value: "Architecture",
        key: "architecture",
        icon: <Building2 className="w-7 h-7" />,
        iconBgVar: "var(--ob-icon-bg-yellow)",
        iconColorVar: "var(--ob-icon-yellow)",
    },
    {
        value: "Medicine",
        key: "medicine",
        icon: <Stethoscope className="w-7 h-7" />,
        iconBgVar: "var(--ob-icon-bg-red)",
        iconColorVar: "var(--ob-icon-red)",
    },
    {
        value: "Business",
        key: "business",
        icon: <BarChart3 className="w-7 h-7" />,
        iconBgVar: "var(--ob-icon-bg-green)",
        iconColorVar: "var(--ob-icon-green)",
    },
    {
        value: "Design",
        key: "design",
        icon: <Palette className="w-7 h-7" />,
        iconBgVar: "var(--ob-icon-bg-purple)",
        iconColorVar: "var(--ob-icon-purple)",
    },
    {
        value: "Other",
        key: "other",
        icon: <Sparkles className="w-7 h-7" />,
        iconBgVar: "var(--ob-icon-bg-teal)",
        iconColorVar: "var(--ob-icon-teal)",
    },
];

interface Props {
    onNext: (data: BackgroundPayload) => void;
    onSkip: () => void;
}

export function StepBackground({ onNext, onSkip }: Props) {
    const { t } = useTranslation("onboarding");
    const [selected, setSelected] = useState<Domain | null>(null);

    return (
        <div>
            <div className="ob-step-head ob-step-head--tight">
                <div className="gb-sec-label justify-center w-full">{t("background.label")}</div>
                <h1 className="ob-step-title">{t("background.title")}</h1>
                <p className="ob-step-sub">{t("background.subtitle")}</p>
            </div>

            <div className="ob-bg-grid">
                {OPTIONS.map((option) => {
                    const isSelected = selected === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setSelected(option.value)}
                            className={cn("ob-bg-card", isSelected && "ob-bg-card--selected")}>
                            <div
                                className="ob-bg-icon-wrap"
                                style={{ background: option.iconBgVar, color: option.iconColorVar }}>
                                {option.icon}
                            </div>
                            <p className="ob-bg-card-title">{t(`background.options.${option.key}.title`)}</p>
                            <p className="ob-bg-card-desc">{t(`background.options.${option.key}.description`)}</p>
                        </button>
                    );
                })}
            </div>

            <StepFooter
                onSkip={onSkip}
                onContinue={() => selected && onNext({ domain: selected })}
                canContinue={!!selected}
            />
        </div>
    );
}
