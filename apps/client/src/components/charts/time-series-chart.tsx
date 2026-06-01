import { useMemo } from "react";
import type { DailyCountPoint } from "@glybette/contracts";

export type TimeSeriesSeries = {
    key: string;
    label: string;
    color: string;
    data: DailyCountPoint[];
};

type TimeSeriesChartProps = {
    series: TimeSeriesSeries[];
    height?: number;
    emptyLabel?: string;
};

const PADDING = { top: 8, right: 4, bottom: 22, left: 4 };

function buildPath(points: Array<{ x: number; y: number }>): string {
    if (points.length === 0) return "";
    return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function buildAreaPath(points: Array<{ x: number; y: number }>, baselineY: number): string {
    if (points.length === 0) return "";
    const line = buildPath(points);
    const last = points[points.length - 1];
    const first = points[0];
    return `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

export function TimeSeriesChart({ series, height = 200, emptyLabel = "No data for this period." }: TimeSeriesChartProps) {
    const dates = series[0]?.data.map((point) => point.date) ?? [];
    const hasData = series.some((item) => item.data.some((point) => point.count > 0));

    const geometry = useMemo(() => {
        const width = 800;
        const innerWidth = width - PADDING.left - PADDING.right;
        const innerHeight = height - PADDING.top - PADDING.bottom;
        const maxY = Math.max(1, ...series.flatMap((item) => item.data.map((point) => point.count)));

        const xAt = (index: number) =>
            dates.length <= 1 ? PADDING.left + innerWidth / 2 : PADDING.left + (index / (dates.length - 1)) * innerWidth;
        const yAt = (count: number) => PADDING.top + innerHeight - (count / maxY) * innerHeight;
        const baselineY = PADDING.top + innerHeight;

        const plotted = series.map((item) => ({
            ...item,
            points: item.data.map((point, index) => ({
                x: xAt(index),
                y: yAt(point.count),
                count: point.count,
            })),
            linePath: buildPath(item.data.map((point, index) => ({ x: xAt(index), y: yAt(point.count) }))),
            areaPath: buildAreaPath(
                item.data.map((point, index) => ({ x: xAt(index), y: yAt(point.count) })),
                baselineY,
            ),
        }));

        const tickIndexes =
            dates.length <= 5
                ? dates.map((_, index) => index)
                : [0, Math.floor(dates.length / 2), dates.length - 1];

        return { width, plotted, tickIndexes, baselineY, maxY };
    }, [dates, height, series]);

    if (!hasData || dates.length === 0) {
        return <p className="py-8 text-center text-sm text-[var(--gb-muted)]">{emptyLabel}</p>;
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-3 text-xs text-[var(--gb-muted)]">
                {geometry.plotted.map((item) => (
                    <span key={item.key} className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                        {item.label}
                    </span>
                ))}
            </div>
            <svg
                viewBox={`0 0 ${geometry.width} ${height}`}
                className="w-full text-[var(--gb-muted)]"
                role="img"
                aria-label="Growth over the last 30 days"
            >
                <line
                    x1={PADDING.left}
                    y1={geometry.baselineY}
                    x2={geometry.width - PADDING.right}
                    y2={geometry.baselineY}
                    stroke="var(--gb-border)"
                    strokeWidth="1"
                />
                {geometry.plotted.map((item) => (
                    <g key={item.key}>
                        <path d={item.areaPath} fill={item.color} fillOpacity={0.12} />
                        <path d={item.linePath} fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" />
                    </g>
                ))}
                {geometry.tickIndexes.map((index) => {
                    const date = dates[index];
                    const x = geometry.plotted[0]?.points[index]?.x ?? PADDING.left;
                    return (
                        <text key={date} x={x} y={height - 4} textAnchor="middle" fontSize="10" fill="currentColor">
                            {date?.slice(5)}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
