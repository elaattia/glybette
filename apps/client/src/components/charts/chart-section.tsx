import type { ElementType } from "react";

export type ChartSectionProps = {
    title: string;
    icon: ElementType;
    accent: string;
};

export function ChartSection({ title, icon: Icon, accent }: ChartSectionProps) {
    return (
        <div className="mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: `${accent}18` }}>
                <Icon className="h-3.5 w-3.5" style={{ color: accent }} aria-hidden />
            </div>
            <h2 className="text-sm font-medium text-[var(--gb-text)]">{title}</h2>
        </div>
    );
}
