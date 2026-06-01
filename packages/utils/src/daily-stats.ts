export const OVERVIEW_GROWTH_DAYS = 30;

export function utcDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/** Start of UTC day, (days - 1) days before today (inclusive 30-day window). */
export function overviewGrowthStartDate(days = OVERVIEW_GROWTH_DAYS): Date {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    return start;
}

export function buildUtcDaySeries(days = OVERVIEW_GROWTH_DAYS): string[] {
    const start = overviewGrowthStartDate(days);
    const keys: string[] = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setUTCDate(start.getUTCDate() + i);
        keys.push(utcDateKey(d));
    }
    return keys;
}

export type DailyCount = { date: string; count: number };

export function fillDailyCounts(buckets: DailyCount[], days = OVERVIEW_GROWTH_DAYS): DailyCount[] {
    const map = new Map(buckets.map((bucket) => [bucket.date, bucket.count]));
    return buildUtcDaySeries(days).map((date) => ({ date, count: map.get(date) ?? 0 }));
}

export function sumDailyCounts(series: DailyCount[]): number {
    return series.reduce((sum, point) => sum + point.count, 0);
}

export function countLastDays(series: DailyCount[], days: number): number {
    if (days <= 0) return 0;
    const slice = series.slice(-days);
    return sumDailyCounts(slice);
}
