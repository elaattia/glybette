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

type AdminUser = {
    id: string;
    email?: string;
    displayName: string;
    baseRole: "student" | "enterprise";
    isAdmin: boolean;
    accountStatus: "active" | "banned";
    emailVerified: boolean;
};

type AdminUsersResponse = { users: AdminUser[] };
type ConfirmState = {
    title: string;
    description: string;
    confirmLabel: string;
    tone?: ConfirmActionTone;
    onConfirm: () => void;
};

export default function AdminUsersManagementPage() {
    const { t } = useLocale("admin");
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
    const usersQuery = useQuery({
        queryKey: ["admin", "users"],
        queryFn: () => apiRequest<AdminUsersResponse>("/api/users/admin/accounts?limit=200"),
    });

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

    const statusMutation = useMutation({
        mutationFn: (payload: { id: string; accountStatus: "active" | "banned" }) =>
            apiRequest(`/api/users/admin/accounts/${payload.id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ accountStatus: payload.accountStatus }),
            }),
        onSuccess: refresh,
    });

    const roleMutation = useMutation({
        mutationFn: (payload: { id: string; baseRole: "student" | "enterprise" }) =>
            apiRequest(`/api/users/admin/accounts/${payload.id}/base-role`, {
                method: "PATCH",
                body: JSON.stringify({ baseRole: payload.baseRole }),
            }),
        onSuccess: refresh,
    });

    const adminMutation = useMutation({
        mutationFn: (payload: { id: string; isAdmin: boolean }) =>
            apiRequest(`/api/users/admin/accounts/${payload.id}/admin`, {
                method: "PATCH",
                body: JSON.stringify({ isAdmin: payload.isAdmin }),
            }),
        onSuccess: refresh,
    });

    const verifyMutation = useMutation({
        mutationFn: (payload: { id: string; emailVerified: boolean }) =>
            apiRequest(`/api/users/admin/accounts/${payload.id}/verification`, {
                method: "PATCH",
                body: JSON.stringify({ emailVerified: payload.emailVerified }),
            }),
        onSuccess: refresh,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) =>
            apiRequest(`/api/users/admin/accounts/${id}`, {
                method: "DELETE",
            }),
        onSuccess: refresh,
    });

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return usersQuery.data?.users ?? [];
        return (usersQuery.data?.users ?? []).filter((user: AdminUser) =>
            [user.id, user.displayName, user.email ?? "", user.baseRole, user.accountStatus].join(" ").toLowerCase().includes(term),
        );
    }, [search, usersQuery.data?.users]);
    const isMutating =
        statusMutation.isPending ||
        roleMutation.isPending ||
        adminMutation.isPending ||
        verifyMutation.isPending ||
        deleteMutation.isPending;

    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
            <CardHeader className="px-5 pt-5 md:px-6">
                <CardTitle className="text-base text-[var(--gb-text)]">{t("users.title")}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                <div className="mb-3">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        placeholder={t("users.searchPlaceholder")}
                        className="max-w-xl"
                    />
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--gb-border)]">
                    <table className="w-full min-w-[980px] text-left text-sm">
                        <thead className="bg-[var(--gb-app-hover)] text-xs uppercase tracking-[0.08em] text-[var(--gb-muted)]">
                            <tr>
                                <th className="px-3 py-2">{t("common.displayName")}</th>
                                <th className="px-3 py-2">{t("common.email")}</th>
                                <th className="px-3 py-2">{t("common.baseRole")}</th>
                                <th className="px-3 py-2">{t("common.admin")}</th>
                                <th className="px-3 py-2">{t("common.status")}</th>
                                <th className="px-3 py-2">{t("common.verified")}</th>
                                <th className="px-3 py-2">{t("common.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersQuery.isPending ? <AdminTableSkeleton columns={7} /> : null}
                            {!usersQuery.isPending
                                ? filteredUsers.map((user) => {
                                      const nextRole = user.baseRole === "student" ? "enterprise" : "student";
                                      return (
                                          <tr key={user.id} className="border-t border-[var(--gb-border)] text-[var(--gb-text)]">
                                              <td className="px-3 py-2">
                                                  <p className="font-medium">{user.displayName}</p>
                                                  <Badge variant="outline" appearance="metadata" className="mt-1">
                                                      {user.id}
                                                  </Badge>
                                              </td>
                                              <td className="px-3 py-2 text-[var(--gb-muted)]">
                                                  {user.email ? (
                                                      user.email
                                                  ) : (
                                                      <Badge variant="outline" className="border-[var(--gb-border)] text-[var(--gb-muted)]">
                                                          {t("common.noEmail")}
                                                      </Badge>
                                                  )}
                                              </td>
                                              <td className="px-3 py-2">
                                                  <Badge variant="outline" tone={user.baseRole === "enterprise" ? "info" : "neutral"}>
                                                      {t(`common.roles.${user.baseRole}`)}
                                                  </Badge>
                                              </td>
                                              <td className="px-3 py-2">
                                                  <Badge
                                                      variant={user.isAdmin ? "default" : "secondary"}
                                                      tone={user.isAdmin ? "warning" : "neutral"}
                                                  >
                                                      {t(`common.adminBadge.${user.isAdmin ? "admin" : "member"}`)}
                                                  </Badge>
                                              </td>
                                              <td className="px-3 py-2">
                                                  <Badge variant="outline" tone={user.accountStatus === "banned" ? "error" : "success"}>
                                                      {t(`common.accountStatus.${user.accountStatus}`)}
                                                  </Badge>
                                              </td>
                                              <td className="px-3 py-2">
                                                  <Badge
                                                      variant={user.emailVerified ? "default" : "outline"}
                                                      tone={user.emailVerified ? "success" : "neutral"}
                                                  >
                                                      {t(`common.verification.${user.emailVerified ? "verified" : "unverified"}`)}
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
                                                                      user.accountStatus === "banned"
                                                                          ? t("users.confirm.unbanTitle")
                                                                          : t("users.confirm.banTitle"),
                                                                  description:
                                                                      user.accountStatus === "banned"
                                                                          ? t("users.confirm.unbanDescription", { name: user.displayName })
                                                                          : t("users.confirm.banDescription", { name: user.displayName }),
                                                                  confirmLabel:
                                                                      user.accountStatus === "banned"
                                                                          ? t("users.confirm.confirmUnban")
                                                                          : t("users.confirm.confirmBan"),
                                                                  tone: "danger",
                                                                  onConfirm: () =>
                                                                      statusMutation.mutate({
                                                                          id: user.id,
                                                                          accountStatus: user.accountStatus === "banned" ? "active" : "banned",
                                                                      }),
                                                              })
                                                          }
                                                      >
                                                          {user.accountStatus === "banned" ? t("users.unban") : t("users.ban")}
                                                      </Button>
                                                      <Button
                                                          size="sm"
                                                          variant="outline"
                                                          onClick={() =>
                                                              setConfirmState({
                                                                  title: user.emailVerified
                                                                      ? t("users.confirm.revokeVerificationTitle")
                                                                      : t("users.confirm.verifyTitle"),
                                                                  description: user.emailVerified
                                                                      ? t("users.confirm.revokeVerificationDescription", { name: user.displayName })
                                                                      : t("users.confirm.verifyDescription", { name: user.displayName }),
                                                                  confirmLabel: user.emailVerified
                                                                      ? t("users.confirm.revokeVerificationLabel")
                                                                      : t("users.confirm.verifyUser"),
                                                                  onConfirm: () =>
                                                                      verifyMutation.mutate({
                                                                          id: user.id,
                                                                          emailVerified: !user.emailVerified,
                                                                      }),
                                                              })
                                                          }
                                                      >
                                                          {user.emailVerified ? t("users.revokeVerification") : t("users.verify")}
                                                      </Button>
                                                      <Button
                                                          size="sm"
                                                          variant="outline"
                                                          onClick={() =>
                                                              setConfirmState({
                                                                  title: t("users.confirm.switchRoleTitle"),
                                                                  description: t("users.confirm.switchRoleDescription", {
                                                                      name: user.displayName,
                                                                      role: t(`common.roles.${nextRole}`),
                                                                  }),
                                                                  confirmLabel: t("users.confirm.confirmRoleSwitch"),
                                                                  onConfirm: () =>
                                                                      roleMutation.mutate({
                                                                          id: user.id,
                                                                          baseRole: nextRole,
                                                                      }),
                                                              })
                                                          }
                                                      >
                                                          {t("users.switchRole")}
                                                      </Button>
                                                      <Button
                                                          size="sm"
                                                          variant="outline"
                                                          onClick={() =>
                                                              setConfirmState({
                                                                  title: user.isAdmin
                                                                      ? t("users.confirm.revokeAdminTitle")
                                                                      : t("users.confirm.grantAdminTitle"),
                                                                  description: t("users.confirm.adminChangeDescription", { name: user.displayName }),
                                                                  confirmLabel: user.isAdmin
                                                                      ? t("users.confirm.revokeAdminLabel")
                                                                      : t("users.confirm.grantAdminLabel"),
                                                                  tone: "danger",
                                                                  onConfirm: () =>
                                                                      adminMutation.mutate({
                                                                          id: user.id,
                                                                          isAdmin: !user.isAdmin,
                                                                      }),
                                                              })
                                                          }
                                                      >
                                                          {user.isAdmin ? t("users.revokeAdmin") : t("users.grantAdmin")}
                                                      </Button>
                                                      <Button
                                                          size="sm"
                                                          variant="destructive"
                                                          onClick={() =>
                                                              setConfirmState({
                                                                  title: t("users.confirm.deleteTitle"),
                                                                  description: t("users.confirm.deleteDescription", { name: user.displayName }),
                                                                  confirmLabel: t("users.confirm.deleteUser"),
                                                                  tone: "danger",
                                                                  onConfirm: () => deleteMutation.mutate(user.id),
                                                              })
                                                          }
                                                      >
                                                          {t("common.delete")}
                                                      </Button>
                                                  </div>
                                              </td>
                                          </tr>
                                      );
                                  })
                                : null}
                            {!usersQuery.isPending && filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-3 py-6 text-center text-sm text-[var(--gb-muted)]">
                                        {t("users.empty")}
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
                isLoading={isMutating}
            />
        </Card>
    );
}
