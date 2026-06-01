export function fmt(n: number) {
    return new Intl.NumberFormat("fr-FR").format(n);
}

export function fmtPct(n: number) {
    return `${n.toFixed(1)} %`;
}

export function topEntries(values: string[] = [], limit = 8) {
    const counts = values.reduce<Record<string, number>>((acc, value) => {
        if (!value) return acc;
        acc[value] = (acc[value] ?? 0) + 1;
        return acc;
    }, {});
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([label, count]) => ({ label, count }));
}

export function recordToEntries(record: Record<string, number> = {}, limit = 12) {
    return Object.entries(record)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([label, count]) => ({ label, count }));
}

export function maxCount(entries: Array<{ count: number }>, fallback = 1) {
    return entries[0]?.count ?? fallback;
}
