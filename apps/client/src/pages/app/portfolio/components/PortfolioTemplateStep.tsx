import type { CSSProperties } from "react";
import type { PortfolioTemplateId } from "@glybette/contracts";
import { portfolioTemplates } from "@/components/portfolio/template-config";
import { cn } from "@/lib/utils";

type PortfolioTemplateStepProps = {
    onChooseTemplate: (templateId: PortfolioTemplateId) => void;
};

export function PortfolioTemplateStep({ onChooseTemplate }: PortfolioTemplateStepProps) {
    return (
        <div className="space-y-5">
            <div>
                <p className="gb-sec-label">Portfolio templates</p>
                <h1 className="font-['Bricolage_Grotesque'] text-3xl font-semibold tracking-[-0.04em]">
                    Pick a starting point
                </h1>
                <p className="mt-2 text-sm text-[var(--gb-muted)]">
                    Templates define layout rules, component styling, and the grid your blocks snap to.
                </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                {portfolioTemplates.map((template) => (
                    <button
                        key={template.id}
                        type="button"
                        onClick={() => onChooseTemplate(template.id)}
                        className="overflow-hidden rounded-3xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] p-3 text-left transition hover:-translate-y-1 hover:border-[#16A34A]/50"
                    >
                        <div
                            className={cn("relative h-48 overflow-hidden rounded-2xl p-5", template.previewClassName)}
                            style={{ "--portfolio-accent": template.defaultStyle.accentColor } as CSSProperties}
                        >
                            <div className={cn("absolute inset-0 opacity-35", template.backgroundArtClassName)} />
                            <div className={cn("relative h-full border p-4", template.surfaceClassName, template.pickerSurfaceClassName)}>
                                <p className={cn("text-xs uppercase tracking-[0.3em]", template.accentClassName)}>
                                    {template.tone}
                                </p>
                                <p className={cn("text-3xl font-semibold tracking-[-0.06em]", template.pickerTitleClassName)}>
                                    {template.name}
                                </p>
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="font-medium text-[var(--gb-text)]">{template.name}</p>
                            <p className="mt-1 text-sm leading-6 text-[var(--gb-muted)]">{template.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
