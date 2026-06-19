import { fmt, fmtPct } from "@/components/charts/chart-utils";
import { useLocale } from "@/hooks/useLocale";

export type BarRowProps = {
    label: string;
    count: number;
    max: number;
    pct?: number;
    accent: string;
};

export function BarRow({ label, count, max, pct, accent }: BarRowProps) {
    const { locale } = useLocale();
    const width = max ? (count / max) * 100 : 0;
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-sm">
                <span className="max-w-[60%] truncate text-[var(--gb-text)]">{label}</span>
                <span className="flex-shrink-0 text-[var(--gb-text-off)] tabular-nums">
                    {fmt(count, locale)}
                    {pct !== undefined ? <span className="ml-1 text-xs opacity-60">({fmtPct(pct, locale)})</span> : null}
                </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--gb-border)]">
                <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${width}%`, background: accent }}
                />
            </div>
        </div>
    );
}
