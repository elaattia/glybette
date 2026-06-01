import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Input } from "@/components/ui/input";
import { AdminTableSkeleton } from "@/pages/app/admin/components/admin-skeletons";

type ScrapingStats = {
    total_actives: number;
    total_archives: number;
    nouvelles_24h: number;
};

export default function AdminScrapingManagementPage() {
    const [search, setSearch] = useState("");
    const [targetSource, setTargetSource] = useState<string | null>(null);
    const statsQuery = useQuery({
        queryKey: ["admin", "scraping", "stats"],
        queryFn: () => apiRequest<ScrapingStats>("/api/scraping/admin/stats"),
    });
    const triggerMutation = useMutation({
        mutationFn: (source: string) =>
            apiRequest("/api/scraping/admin/trigger", {
                method: "POST",
                body: JSON.stringify({ source }),
            }),
    });

    const metricRows = useMemo(
        () => [
            { metric: "Active offers", value: statsQuery.data?.total_actives ?? 0 },
            { metric: "Archived offers", value: statsQuery.data?.total_archives ?? 0 },
            { metric: "New offers (24h)", value: statsQuery.data?.nouvelles_24h ?? 0 },
        ],
        [statsQuery.data?.nouvelles_24h, statsQuery.data?.total_actives, statsQuery.data?.total_archives],
    );
    const filteredMetricRows = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return metricRows;
        return metricRows.filter((row: { metric: string; value: number }) => row.metric.toLowerCase().includes(term));
    }, [metricRows, search]);

    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
            <CardHeader className="px-5 pt-5 md:px-6">
                <CardTitle className="text-base text-[var(--gb-text)]">Scraping management</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                <div className="mb-3">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        placeholder="Search metrics"
                        className="max-w-xl"
                    />
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--gb-border)]">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-[var(--gb-app-hover)] text-xs uppercase tracking-[0.08em] text-[var(--gb-muted)]">
                            <tr>
                                <th className="px-3 py-2">Metric</th>
                                <th className="px-3 py-2">Value</th>
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statsQuery.isPending ? <AdminTableSkeleton columns={3} rows={3} /> : null}
                            {!statsQuery.isPending
                                ? filteredMetricRows.map((row) => (
                                <tr key={row.metric} className="border-t border-[var(--gb-border)] text-[var(--gb-text)]">
                                    <td className="px-3 py-2">
                                        <Badge variant="secondary" tone="neutral">
                                            {row.metric}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge variant="outline" tone={row.value > 0 ? "success" : "neutral"}>
                                            {row.value}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setTargetSource("all")}>
                                                Trigger all sources
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setTargetSource("linkedin")}>
                                                Trigger LinkedIn
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setTargetSource("indeed")}>
                                                Trigger Indeed
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                                : null}
                            {!statsQuery.isPending && filteredMetricRows.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-3 py-6 text-center text-sm text-[var(--gb-muted)]">
                                        No metrics found for this search.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </CardContent>
            <ConfirmActionDialog
                open={Boolean(targetSource)}
                onOpenChange={(open) => {
                    if (!open) setTargetSource(null);
                }}
                title="Trigger scraping job"
                description={targetSource ? `Run scraping for "${targetSource}" now?` : ""}
                confirmLabel="Run scraping"
                onConfirm={() => {
                    if (targetSource) {
                        triggerMutation.mutate(targetSource);
                    }
                }}
                isLoading={triggerMutation.isPending}
            />
        </Card>
    );
}
