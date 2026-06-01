import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmActionDialog, type ConfirmActionTone } from "@/components/ui/confirm-action-dialog";
import { Input } from "@/components/ui/input";

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
                <CardTitle className="text-base text-[var(--gb-text)]">Users management</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                <div className="mb-3">
                    <Input
                        value={search}
                        onChange={(event: Event) => setSearch((event.currentTarget as HTMLInputElement).value)}
                        placeholder="Search by name, email, role, status, or user id"
                        className="max-w-xl"
                    />
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--gb-border)]">
                    <table className="w-full min-w-[980px] text-left text-sm">
                        <thead className="bg-[var(--gb-app-hover)] text-xs uppercase tracking-[0.08em] text-[var(--gb-muted)]">
                            <tr>
                                <th className="px-3 py-2">Display name</th>
                                <th className="px-3 py-2">Email</th>
                                <th className="px-3 py-2">Base role</th>
                                <th className="px-3 py-2">Admin</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Verified</th>
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-t border-[var(--gb-border)] text-[var(--gb-text)]">
                                    <td className="px-3 py-2 font-medium">{user.displayName}</td>
                                    <td className="px-3 py-2 text-[var(--gb-muted)]">{user.email ?? "No email"}</td>
                                    <td className="px-3 py-2">{user.baseRole}</td>
                                    <td className="px-3 py-2">{user.isAdmin ? "yes" : "no"}</td>
                                    <td className="px-3 py-2">{user.accountStatus}</td>
                                    <td className="px-3 py-2">{user.emailVerified ? "yes" : "no"}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setConfirmState({
                                                        title: `${user.accountStatus === "banned" ? "Unban" : "Ban"} user`,
                                                        description: `Are you sure you want to ${user.accountStatus === "banned" ? "unban" : "ban"} ${user.displayName}?`,
                                                        confirmLabel: user.accountStatus === "banned" ? "Confirm unban" : "Confirm ban",
                                                        tone: "danger",
                                                        onConfirm: () =>
                                                            statusMutation.mutate({
                                                                id: user.id,
                                                                accountStatus: user.accountStatus === "banned" ? "active" : "banned",
                                                            }),
                                                    })
                                                }>
                                                {user.accountStatus === "banned" ? "Unban" : "Ban"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setConfirmState({
                                                        title: `${user.emailVerified ? "Revoke verification" : "Verify"} user`,
                                                        description: `Confirm ${user.emailVerified ? "verification revocation" : "verification"} for ${user.displayName}.`,
                                                        confirmLabel: user.emailVerified ? "Revoke verification" : "Verify user",
                                                        onConfirm: () =>
                                                            verifyMutation.mutate({
                                                                id: user.id,
                                                                emailVerified: !user.emailVerified,
                                                            }),
                                                    })
                                                }>
                                                {user.emailVerified ? "Revoke verification" : "Verify"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setConfirmState({
                                                        title: "Switch base role",
                                                        description: `Move ${user.displayName} to ${user.baseRole === "student" ? "enterprise" : "student"} role?`,
                                                        confirmLabel: "Confirm role switch",
                                                        onConfirm: () =>
                                                            roleMutation.mutate({
                                                                id: user.id,
                                                                baseRole: user.baseRole === "student" ? "enterprise" : "student",
                                                            }),
                                                    })
                                                }>
                                                Switch role
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setConfirmState({
                                                        title: `${user.isAdmin ? "Revoke" : "Grant"} admin access`,
                                                        description: `Confirm admin privilege change for ${user.displayName}.`,
                                                        confirmLabel: user.isAdmin ? "Revoke admin" : "Grant admin",
                                                        tone: "danger",
                                                        onConfirm: () =>
                                                            adminMutation.mutate({
                                                                id: user.id,
                                                                isAdmin: !user.isAdmin,
                                                            }),
                                                    })
                                                }>
                                                {user.isAdmin ? "Revoke admin" : "Grant admin"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    setConfirmState({
                                                        title: "Delete user account",
                                                        description: `This will permanently delete ${user.displayName}. This action cannot be undone.`,
                                                        confirmLabel: "Delete user",
                                                        tone: "danger",
                                                        onConfirm: () => deleteMutation.mutate(user.id),
                                                    })
                                                }>
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-3 py-6 text-center text-sm text-[var(--gb-muted)]">
                                        No users found for this search.
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
                isLoading={isMutating}
            />
        </Card>
    );
}
