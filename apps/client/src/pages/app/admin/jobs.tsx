import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmActionDialog, type ConfirmActionTone } from "@/components/ui/confirm-action-dialog";
import { Input } from "@/components/ui/input";
import { AdminTableSkeleton } from "@/pages/app/admin/components/admin-skeletons";
import { useLocale } from "@/hooks/useLocale";

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
    const { t } = useLocale("admin");
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
                <CardTitle className="text-base text-[var(--gb-text)]">{t("jobs.title")}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                <div className="mb-3">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        placeholder={t("jobs.searchPlaceholder")}
                        className="max-w-xl"
                    />
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--gb-border)]">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="bg-[var(--gb-app-hover)] text-xs uppercase tracking-[0.08em] text-[var(--gb-muted)]">
                            <tr>
                                <th className="px-3 py-2">{t("common.title")}</th>
                                <th className="px-3 py-2">{t("common.company")}</th>
                                <th className="px-3 py-2">{t("common.status")}</th>
                                <th className="px-3 py-2">{t("common.actions")}</th>
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
                                                  appearance={job.entreprise ? undefined : "metadata"}
                                              >
                                                  {job.entreprise ?? t("common.unknownCompany")}
                                              </Badge>
                                          </td>
                                          <td className="px-3 py-2">
                                              <Badge variant="outline" tone={job.status === "active" ? "success" : "warning"}>
                                                  {t(`common.jobStatus.${job.status === "archivee" ? "archived" : "active"}`)}
                                              </Badge>
                                          </td>
                                          <td className="px-3 py-2">
                                              <div className="flex flex-wrap gap-2">
                                                  <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() =>
                                                          setConfirmState({
                                                              title:
                                                                  job.status === "active"
                                                                      ? t("jobs.confirm.archiveTitle")
                                                                      : t("jobs.confirm.activateTitle"),
                                                              description:
                                                                  job.status === "active"
                                                                      ? t("jobs.confirm.archiveDescription", { title: job.titre })
                                                                      : t("jobs.confirm.activateDescription", { title: job.titre }),
                                                              confirmLabel:
                                                                  job.status === "active"
                                                                      ? t("jobs.confirm.archiveJob")
                                                                      : t("jobs.confirm.activateJob"),
                                                              onConfirm: () =>
                                                                  statusMutation.mutate({
                                                                      id: job._id,
                                                                      status: job.status === "active" ? "archivee" : "active",
                                                                  }),
                                                          })
                                                      }
                                                  >
                                                      {job.status === "active" ? t("jobs.archive") : t("jobs.activate")}
                                                  </Button>
                                                  <Button
                                                      size="sm"
                                                      variant="destructive"
                                                      onClick={() =>
                                                          setConfirmState({
                                                              title: t("jobs.confirm.deleteTitle"),
                                                              description: t("jobs.confirm.deleteDescription", { title: job.titre }),
                                                              confirmLabel: t("jobs.confirm.deleteJob"),
                                                              tone: "danger",
                                                              onConfirm: () => deleteMutation.mutate(job._id),
                                                          })
                                                      }
                                                  >
                                                      {t("common.delete")}
                                                  </Button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))
                                : null}
                            {!query.isPending && filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-3 py-6 text-center text-sm text-[var(--gb-muted)]">
                                        {t("jobs.empty")}
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
                confirmLabel={confirmState?.confirmLabel ?? t("common.confirm")}
                tone={confirmState?.tone}
                onConfirm={() => confirmState?.onConfirm()}
                isLoading={statusMutation.isPending || deleteMutation.isPending}
            />
        </Card>
    );
}
