import { useState } from "react";
import { Monitor, Building2, Stethoscope, BarChart3, Palette, Sparkles } from "lucide-react";
import type { BackgroundPayload, Domain } from "@glybette/types";
import { cn } from "@/lib/utils";
import { StepFooter } from "./StepFooter";

const OPTIONS: {
  value: Domain;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgVar: string;
  iconColorVar: string;
}[] = [
  { value: "IT", icon: <Monitor className="w-7 h-7" />, title: "IT", description: "Software, data, cybersecurity...", iconBgVar: "var(--ob-icon-bg-blue)", iconColorVar: "var(--ob-icon-blue)" },
  { value: "Architecture", icon: <Building2 className="w-7 h-7" />, title: "Architecture", description: "Design, urban planning...", iconBgVar: "var(--ob-icon-bg-yellow)", iconColorVar: "var(--ob-icon-yellow)" },
  { value: "Medicine", icon: <Stethoscope className="w-7 h-7" />, title: "Medicine", description: "Health, pharmacy, biology...", iconBgVar: "var(--ob-icon-bg-red)", iconColorVar: "var(--ob-icon-red)" },
  { value: "Business", icon: <BarChart3 className="w-7 h-7" />, title: "Business", description: "Finance, marketing, management...", iconBgVar: "var(--ob-icon-bg-green)", iconColorVar: "var(--ob-icon-green)" },
  { value: "Design", icon: <Palette className="w-7 h-7" />, title: "Design", description: "UI/UX, graphic, motion...", iconBgVar: "var(--ob-icon-bg-purple)", iconColorVar: "var(--ob-icon-purple)" },
  { value: "Other", icon: <Sparkles className="w-7 h-7" />, title: "Other", description: "Something else entirely", iconBgVar: "var(--ob-icon-bg-teal)", iconColorVar: "var(--ob-icon-teal)" },
];

interface Props {
  onNext: (data: BackgroundPayload) => void;
  onSkip: () => void;
}

export function StepBackground({ onNext, onSkip }: Props) {
  const [selected, setSelected] = useState<Domain | null>(null);

  return (
    <div>
      <div className="ob-step-head ob-step-head--tight">
        <div className="gb-sec-label justify-center w-full">Background</div>
        <h1 className="ob-step-title">Your background</h1>
        <p className="ob-step-sub">
          What is your field of expertise? This helps us show relevant opportunities.
        </p>
      </div>

      <div className="ob-bg-grid">
        {OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              className={cn("ob-bg-card", isSelected && "ob-bg-card--selected")}
            >
              <div
                className="ob-bg-icon-wrap"
                style={{ background: option.iconBgVar, color: option.iconColorVar }}
              >
                {option.icon}
              </div>
              <p className="ob-bg-card-title">{option.title}</p>
              <p className="ob-bg-card-desc">{option.description}</p>
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
