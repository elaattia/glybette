import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Input } from "@/components/ui/input";
import { AdminTableSkeleton } from "@/pages/app/admin/components/admin-skeletons";

type PortfolioRow = {
    id: string;
    userId: string;
    owner?: { id: string; displayName: string };
    slug: string;
    updatedAt: string;
};
type PortfolioResponse = { portfolios: PortfolioRow[] };

export default function AdminPortfolioManagementPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [targetPortfolio, setTargetPortfolio] = useState<PortfolioRow | null>(null);
    const query = useQuery({
        queryKey: ["admin", "portfolio"],
        queryFn: () => apiRequest<PortfolioResponse>("/api/portfolio/admin/list?limit=200"),
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest(`/api/portfolio/admin/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "portfolio"] }),
    });

    const filteredPortfolios = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return query.data?.portfolios ?? [];
        return (query.data?.portfolios ?? []).filter((portfolio: PortfolioRow) =>
            [portfolio.id, portfolio.slug, portfolio.owner?.displayName ?? portfolio.userId].join(" ").toLowerCase().includes(term),
        );
    }, [query.data?.portfolios, search]);

    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
            <CardHeader className="px-5 pt-5 md:px-6">
                <CardTitle className="text-base text-[var(--gb-text)]">Portfolio management</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                <div className="mb-3">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        placeholder="Search by slug, user, or portfolio id"
                        className="max-w-xl"
                    />
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--gb-border)]">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="bg-[var(--gb-app-hover)] text-xs uppercase tracking-[0.08em] text-[var(--gb-muted)]">
                            <tr>
                                <th className="px-3 py-2">Entity ID</th>
                                <th className="px-3 py-2">Slug</th>
                                <th className="px-3 py-2">User</th>
                                <th className="px-3 py-2">Updated</th>
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {query.isPending ? <AdminTableSkeleton columns={5} /> : null}
                            {!query.isPending
                                ? filteredPortfolios.map((portfolio) => (
                                <tr key={portfolio.id} className="border-t border-[var(--gb-border)] text-[var(--gb-text)]">
                                    <td className="px-3 py-2 text-[var(--gb-muted)]">
                                        <Badge variant="outline" appearance="metadata">
                                            {portfolio.id}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 font-medium">
                                        <Badge variant="secondary" tone="neutral">
                                            {portfolio.slug}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Badge variant="secondary" tone="neutral">
                                                {portfolio.owner?.displayName ?? "Unknown owner"}
                                            </Badge>
                                            <Badge variant="outline" appearance="metadata">
                                                {portfolio.owner?.id ?? portfolio.userId}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-[var(--gb-muted)]">
                                        <Badge variant="outline" className="border-[var(--gb-border)] text-[var(--gb-muted)]">
                                            {new Date(portfolio.updatedAt).toLocaleString()}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <Button size="sm" variant="destructive" onClick={() => setTargetPortfolio(portfolio)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                                : null}
                            {!query.isPending && filteredPortfolios.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-[var(--gb-muted)]">
                                        No portfolios found for this search.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </CardContent>
            <ConfirmActionDialog
                open={Boolean(targetPortfolio)}
                onOpenChange={(open) => {
                    if (!open) setTargetPortfolio(null);
                }}
                title="Delete portfolio"
                description={
                    targetPortfolio
                        ? `Delete portfolio "${targetPortfolio.slug}" (${targetPortfolio.id})? This cannot be undone.`
                        : ""
                }
                confirmLabel="Delete portfolio"
                tone="danger"
                onConfirm={() => {
                    if (targetPortfolio) {
                        deleteMutation.mutate(targetPortfolio.id);
                    }
                }}
                isLoading={deleteMutation.isPending}
            />
        </Card>
    );
}
