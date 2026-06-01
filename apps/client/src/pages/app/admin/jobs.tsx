import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmActionDialog, type ConfirmActionTone } from "@/components/ui/confirm-action-dialog";
import { Input } from "@/components/ui/input";
import { AdminTableSkeleton } from "@/pages/app/admin/components/admin-skeletons";

type JobRow = {
    _id: string;
    titre: string;
    entreprise?: string;
    status: "active" | "archivee";
};

type JobsResponse = { offres: JobRow[] };
type ConfirmState = {
    title: string;
    description: string;
    confirmLabel: string;
    tone?: ConfirmActionTone;
    onConfirm: () => void;
};

export default function AdminJobsManagementPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
    const query = useQuery({
        queryKey: ["admin", "jobs"],
        queryFn: () => apiRequest<JobsResponse>("/api/jobs/admin/offres?limit=200"),
    });

    const statusMutation = useMutation({
        mutationFn: (payload: { id: string; status: "active" | "archivee" }) =>
            apiRequest(`/api/jobs/admin/offres/${payload.id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: payload.status }),
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] }),
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest(`/api/jobs/admin/offres/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] }),
    });

    const filteredJobs = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return query.data?.offres ?? [];
        return (query.data?.offres ?? []).filter((job: JobRow) =>
            [job._id, job.titre, job.entreprise ?? "", job.status].join(" ").toLowerCase().includes(term),
        );
    }, [query.data?.offres, search]);

    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
            <CardHeader className="px-5 pt-5 md:px-6">
                <CardTitle className="text-base text-[var(--gb-text)]">Jobs management</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                <div className="mb-3">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        placeholder="Search by title, company, status, or job id"
                        className="max-w-xl"
                    />
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--gb-border)]">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="bg-[var(--gb-app-hover)] text-xs uppercase tracking-[0.08em] text-[var(--gb-muted)]">
                            <tr>
                                <th className="px-3 py-2">Title</th>
                                <th className="px-3 py-2">Company</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {query.isPending ? <AdminTableSkeleton columns={4} /> : null}
                            {!query.isPending
                                ? filteredJobs.map((job) => (
                                <tr key={job._id} className="border-t border-[var(--gb-border)] text-[var(--gb-text)]">
                                    <td className="px-3 py-2">
                                        <p className="font-medium">{job.titre}</p>
                                        <Badge variant="outline" appearance="metadata" className="mt-1">
                                            {job._id}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-[var(--gb-muted)]">
                                        <Badge
                                            variant={job.entreprise ? "secondary" : "outline"}
                                            tone={job.entreprise ? "neutral" : undefined}
                                            appearance={job.entreprise ? undefined : "metadata"}>
                                            {job.entreprise ?? "Unknown company"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge variant="outline" tone={job.status === "active" ? "success" : "warning"}>
                                            {job.status === "archivee" ? "archived" : job.status}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setConfirmState({
                                                        title: `${job.status === "active" ? "Archive" : "Activate"} job`,
                                                        description: `Confirm ${job.status === "active" ? "archiving" : "activation"} for "${job.titre}".`,
                                                        confirmLabel: job.status === "active" ? "Archive job" : "Activate job",
                                                        onConfirm: () =>
                                                            statusMutation.mutate({
                                                                id: job._id,
                                                                status: job.status === "active" ? "archivee" : "active",
                                                            }),
                                                    })
                                                }>
                                                {job.status === "active" ? "Archive" : "Activate"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    setConfirmState({
                                                        title: "Delete job",
                                                        description: `Delete "${job.titre}" permanently? This action cannot be undone.`,
                                                        confirmLabel: "Delete job",
                                                        tone: "danger",
                                                        onConfirm: () => deleteMutation.mutate(job._id),
                                                    })
                                                }>
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                                : null}
                            {!query.isPending && filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-3 py-6 text-center text-sm text-[var(--gb-muted)]">
                                        No jobs found for this search.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </CardContent>
            <ConfirmActionDialog
                open={Boolean(confirmState)}
                onOpenChange={(open) => {
                    if (!open) setConfirmState(null);
                }}
                title={confirmState?.title ?? ""}
                description={confirmState?.description ?? ""}
                confirmLabel={confirmState?.confirmLabel ?? "Confirm"}
                tone={confirmState?.tone}
                onConfirm={() => confirmState?.onConfirm()}
                isLoading={statusMutation.isPending || deleteMutation.isPending}
            />
        </Card>
    );
}
