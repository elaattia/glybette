import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Input } from "@/components/ui/input";

type AdminProjectsResponse = {
    items: Array<{
        id: string;
        title: string;
        status: string;
        ownerId: string;
        owner?: { id: string; displayName: string };
    }>;
};

export default function AdminProjectsManagementPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [targetProject, setTargetProject] = useState<AdminProjectsResponse["items"][number] | null>(null);
    const query = useQuery({
        queryKey: ["admin", "projects"],
        queryFn: () => apiRequest<AdminProjectsResponse>("/api/projects/admin/list?limit=200"),
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest(`/api/projects/admin/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "projects"] }),
    });

    const filteredItems = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return query.data?.items ?? [];
        return (query.data?.items ?? []).filter((item: AdminProjectsResponse["items"][number]) =>
            [item.id, item.title, item.status, item.owner?.displayName ?? item.ownerId].join(" ").toLowerCase().includes(term),
        );
    }, [query.data?.items, search]);

    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
            <CardHeader className="px-5 pt-5 md:px-6">
                <CardTitle className="text-base text-[var(--gb-text)]">Projects management</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                <div className="mb-3">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        placeholder="Search by title, user, status, or project id"
                        className="max-w-xl"
                    />
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--gb-border)]">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-[var(--gb-app-hover)] text-xs uppercase tracking-[0.08em] text-[var(--gb-muted)]">
                            <tr>
                                <th className="px-3 py-2">Entity ID</th>
                                <th className="px-3 py-2">Title</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">User</th>
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="border-t border-[var(--gb-border)] text-[var(--gb-text)]">
                                    <td className="px-3 py-2 text-[var(--gb-muted)]">
                                        <Badge variant="outline" appearance="metadata">
                                            {item.id}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 font-medium">{item.title}</td>
                                    <td className="px-3 py-2">
                                        <Badge
                                            variant="outline"
                                            tone={
                                                item.status === "published" || item.status === "active"
                                                    ? "success"
                                                    : item.status === "draft" || item.status === "archived"
                                                      ? "warning"
                                                      : "neutral"
                                            }>
                                            {item.status}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Badge variant="secondary" tone="neutral">
                                                {item.owner?.displayName ?? "Unknown owner"}
                                            </Badge>
                                            <Badge variant="outline" appearance="metadata">
                                                {item.owner?.id ?? item.ownerId}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <Button size="sm" variant="destructive" onClick={() => setTargetProject(item)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-[var(--gb-muted)]">
                                        No projects found for this search.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </CardContent>
            <ConfirmActionDialog
                open={Boolean(targetProject)}
                onOpenChange={(open) => {
                    if (!open) setTargetProject(null);
                }}
                title="Delete project"
                description={
                    targetProject
                        ? `Delete project "${targetProject.title}" (${targetProject.id})? This cannot be undone.`
                        : ""
                }
                confirmLabel="Delete project"
                tone="danger"
                onConfirm={() => {
                    if (targetProject) {
                        deleteMutation.mutate(targetProject.id);
                    }
                }}
                isLoading={deleteMutation.isPending}
            />
        </Card>
    );
}
