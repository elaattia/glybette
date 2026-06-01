import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Input } from "@/components/ui/input";
import { AdminTableSkeleton } from "@/pages/app/admin/components/admin-skeletons";

type CvRow = {
    _id: string;
    userId: string;
    owner?: { id: string; displayName: string };
    title: string;
    updatedAt: string;
};
type CvResponse = { cvs: CvRow[] };

export default function AdminCvManagementPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [targetCv, setTargetCv] = useState<CvRow | null>(null);
    const query = useQuery({
        queryKey: ["admin", "cv"],
        queryFn: () => apiRequest<CvResponse>("/api/cvs/admin/list?limit=200"),
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest(`/api/cvs/admin/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "cv"] }),
    });

    const filteredCvs = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return query.data?.cvs ?? [];
        return (query.data?.cvs ?? []).filter((cv: CvRow) =>
            [cv._id, cv.title, cv.owner?.displayName ?? cv.userId].join(" ").toLowerCase().includes(term),
        );
    }, [query.data?.cvs, search]);

    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
            <CardHeader className="px-5 pt-5 md:px-6">
                <CardTitle className="text-base text-[var(--gb-text)]">CV management</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                <div className="mb-3">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        placeholder="Search by title, user, or CV id"
                        className="max-w-xl"
                    />
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--gb-border)]">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="bg-[var(--gb-app-hover)] text-xs uppercase tracking-[0.08em] text-[var(--gb-muted)]">
                            <tr>
                                <th className="px-3 py-2">Entity ID</th>
                                <th className="px-3 py-2">Title</th>
                                <th className="px-3 py-2">User</th>
                                <th className="px-3 py-2">Updated</th>
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {query.isPending ? (
                                <AdminTableSkeleton columns={5} />
                            ) : null}
                            {!query.isPending
                                ? filteredCvs.map((cv) => (
                                <tr key={cv._id} className="border-t border-[var(--gb-border)] text-[var(--gb-text)]">
                                    <td className="px-3 py-2 text-[var(--gb-muted)]">
                                        <Badge variant="outline" appearance="metadata">
                                            {cv._id}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 font-medium">
                                        <Badge variant="secondary" tone="neutral">
                                            {cv.title}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Badge variant="secondary" tone="neutral">
                                                {cv.owner?.displayName ?? "Unknown owner"}
                                            </Badge>
                                            <Badge variant="outline" appearance="metadata">
                                                {cv.owner?.id ?? cv.userId}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-[var(--gb-muted)]">
                                        <Badge variant="outline" className="border-[var(--gb-border)] text-[var(--gb-muted)]">
                                            {new Date(cv.updatedAt).toLocaleString()}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <Button size="sm" variant="destructive" onClick={() => setTargetCv(cv)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                                : null}
                            {!query.isPending && filteredCvs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-[var(--gb-muted)]">
                                        No CVs found for this search.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </CardContent>
            <ConfirmActionDialog
                open={Boolean(targetCv)}
                onOpenChange={(open) => {
                    if (!open) setTargetCv(null);
                }}
                title="Delete CV"
                description={targetCv ? `Delete CV "${targetCv.title}" (${targetCv._id})? This cannot be undone.` : ""}
                confirmLabel="Delete CV"
                tone="danger"
                onConfirm={() => {
                    if (targetCv) {
                        deleteMutation.mutate(targetCv._id);
                    }
                }}
                isLoading={deleteMutation.isPending}
            />
        </Card>
    );
}
