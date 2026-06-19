import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitHubIcon, GoogleIcon, LinkedInIcon } from "@/components/auth/AuthProviderIcons";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification, verificationQueryKeys } from "@/hooks/useEmailVerification";
import { useLocale } from "@/hooks/useLocale";
import { useUser, userQueryKeys } from "@/hooks/useUser";
import type { AppLocale } from "@/i18n";
import { ApiError, apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AuthProvider, OwnAccountResponse, OwnProfileResponse } from "@glybette/contracts";

const ACCOUNT_DELETE_PHRASE = "DELETE MY ACCOUNT";

const PROVIDER_BUTTON_BASE =
    "inline-flex h-auto min-h-12 w-full items-center justify-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-app-ring)] disabled:cursor-default";

const CONNECTED_PROVIDER_BUTTON =
    "border-emerald-700 bg-emerald-600 text-white shadow-sm disabled:opacity-90 disabled:hover:border-emerald-700 disabled:hover:bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-600 dark:text-emerald-50 dark:disabled:hover:border-emerald-500 dark:disabled:hover:bg-emerald-600";

const CONNECTABLE_PROVIDERS: Array<{
    provider: Extract<AuthProvider, "google" | "github" | "linkedin">;
    icon: ReactNode;
    disconnectClassName: string;
    connectedClassName?: string;
}> = [
    {
        provider: "google",
        icon: <GoogleIcon />,
        disconnectClassName:
            "border-[#dadce0] bg-white text-[#1f1f1f] hover:border-[#aecbfa] hover:bg-[#f8f9fa] hover:shadow-[0_1px_2px_rgba(66,133,244,0.2)] dark:border-[var(--gb-border)] dark:bg-[var(--gb-surface2)] dark:text-[var(--gb-text)] dark:hover:border-[#4285f4]/45 dark:hover:bg-[#4285f4]/10",
        connectedClassName:
            "border-emerald-600 bg-white text-[#1f1f1f] shadow-sm disabled:opacity-100 disabled:hover:border-emerald-600 disabled:hover:bg-white dark:border-emerald-500 dark:bg-[var(--gb-surface2)] dark:text-[var(--gb-text)] dark:disabled:hover:border-emerald-500 dark:disabled:hover:bg-[var(--gb-surface2)]",
    },
    {
        provider: "github",
        icon: <GitHubIcon />,
        disconnectClassName:
            "border-[#30363d] bg-[#0d1117] text-[#f0f6fc] hover:border-[#8b949e] hover:bg-[#161b22] hover:shadow-[0_1px_2px_rgba(0,0,0,0.35)] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc] dark:hover:border-[#8b949e] dark:hover:bg-[#161b22]",
    },
    {
        provider: "linkedin",
        icon: <LinkedInIcon />,
        disconnectClassName:
            "border-[#0a66c2] bg-[#0a66c2] text-white hover:border-[#004182] hover:bg-[#004182] hover:shadow-[0_1px_2px_rgba(0,65,130,0.35)] dark:border-[#0a66c2] dark:bg-[#0a66c2] dark:text-white dark:hover:border-[#93c5fd] dark:hover:bg-[#004182]",
    },
];

export default function SettingsPage() {
    const { t } = useTranslation("common");
    const { locale, setLocale } = useLocale("common");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const auth = useAuth();
    const verification = useEmailVerification();
    const { user } = useUser();

    const [accountForm, setAccountForm] = useState({ firstName: "", lastName: "", email: "" });
    const [profileForm, setProfileForm] = useState({ phone: "", location: "" });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteForm, setDeleteForm] = useState({ password: "", confirmText: "" });
    const [accountFeedback, setAccountFeedback] = useState<string | null>(null);
    const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
    const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
    const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

    const hasPasswordCredentials = user?.hasPassword ?? user?.provider === "email";
    const requiresPasswordForDelete = hasPasswordCredentials;
    const connectedProviderList =
        user?.connectedProviders && user.connectedProviders.length > 0
            ? user.connectedProviders
            : user?.provider
              ? [user.provider]
              : [];
    const connectedProviders = new Set(connectedProviderList);

    useEffect(() => {
        if (!user) return;
        setAccountForm((prev) => ({
            firstName: prev.firstName || user.firstName || user.displayName.split(/\s+/)[0] || "",
            lastName: prev.lastName || user.lastName || user.displayName.split(/\s+/).slice(1).join(" ") || "",
            email: prev.email || user.email || "",
        }));
    }, [user]);

    const profileQuery = useQuery({
        queryKey: ["user", "settings-profile"],
        enabled: auth.isAuthenticated,
        queryFn: () => apiRequest<OwnProfileResponse>("/api/users/me/profile"),
    });

    useEffect(() => {
        if (!profileQuery.data?.profile) return;
        setProfileForm({
            phone: profileQuery.data.profile.phone ?? "",
            location: profileQuery.data.profile.location ?? "",
        });
    }, [profileQuery.data]);

    const accountMutation = useMutation({
        mutationFn: (payload: { firstName: string; lastName: string; email: string }) =>
            apiRequest<OwnAccountResponse>("/api/users/me/account", {
                method: "PUT",
                body: JSON.stringify(payload),
            }),
        onSuccess: async (result) => {
            await queryClient.invalidateQueries({ queryKey: userQueryKeys.me });
            await queryClient.invalidateQueries({ queryKey: verificationQueryKeys.status });
            setAccountFeedback(t("settings.account.updated"));

            if (result.requiresEmailVerification) {
                try {
                    await verification.requestOtp();
                } catch {
                    // Gate will still force verification; OTP can be retried on verify page.
                }
                navigate("/verify-email", { replace: true, state: { from: "/app/settings" } });
            }
        },
    });

    const profileMutation = useMutation({
        mutationFn: (payload: { phone?: string; location?: string }) =>
            apiRequest<OwnProfileResponse>("/api/users/me/profile", {
                method: "PUT",
                body: JSON.stringify({ profile: payload }),
            }),
        onSuccess: () => {
            setProfileFeedback(t("settings.contact.updated"));
            void queryClient.invalidateQueries({ queryKey: ["user", "settings-profile"] });
        },
    });

    const passwordMutation = useMutation({
        mutationFn: async (payload: { currentPassword?: string; newPassword: string }) => {
            await auth.changePassword({
                currentPassword: payload.currentPassword,
                newPassword: payload.newPassword,
            });
        },
        onSuccess: async () => {
            setPasswordFeedback(
                hasPasswordCredentials ? t("settings.security.passwordUpdated") : t("settings.security.passwordSet"),
            );
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            await queryClient.invalidateQueries({ queryKey: userQueryKeys.me });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (payload: { password?: string }) => {
            await auth.deleteAccount(payload.password);
        },
        onSuccess: () => {
            navigate("/", { replace: true });
        },
    });

    const accountNamePreview = useMemo(
        () => `${accountForm.firstName.trim()} ${accountForm.lastName.trim()}`.trim(),
        [accountForm.firstName, accountForm.lastName],
    );

    const handleApiError = (error: unknown, fallback: string) => {
        if (error instanceof ApiError) return error.message;
        if (error instanceof Error && error.message) return error.message;
        return fallback;
    };

    return (
        <div className="mx-auto max-w-4xl space-y-4">
            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                <CardHeader className="px-5 pt-5 md:px-6">
                    <CardTitle className="text-base text-[var(--gb-text)]">{t("settings.account.title")}</CardTitle>
                    <CardDescription>{t("settings.account.description")}</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                    <form
                        className="space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            setAccountFeedback(null);
                            const run = async () => {
                                try {
                                    await accountMutation.mutateAsync({
                                        firstName: accountForm.firstName.trim(),
                                        lastName: accountForm.lastName.trim(),
                                        email: accountForm.email.trim(),
                                    });
                                } catch (error) {
                                    setAccountFeedback(handleApiError(error, t("settings.account.updateError")));
                                }
                            };
                            void run();
                        }}>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                                value={accountForm.firstName}
                                onChange={(event) => setAccountForm((prev) => ({ ...prev, firstName: event.target.value }))}
                                placeholder={t("settings.account.firstNamePlaceholder")}
                                required
                            />
                            <Input
                                value={accountForm.lastName}
                                onChange={(event) => setAccountForm((prev) => ({ ...prev, lastName: event.target.value }))}
                                placeholder={t("settings.account.lastNamePlaceholder")}
                                required
                            />
                        </div>
                        <Input
                            type="email"
                            value={accountForm.email}
                            onChange={(event) => setAccountForm((prev) => ({ ...prev, email: event.target.value }))}
                            placeholder={t("settings.account.emailPlaceholder")}
                            required
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" tone={user?.emailVerified ? "success" : "warning"}>
                                {user?.emailVerified
                                    ? t("settings.account.verifiedEmail")
                                    : t("settings.account.verificationRequired")}
                            </Badge>
                            {accountNamePreview ? (
                                <Badge variant="outline" tone="neutral">
                                    {t("settings.account.fullNameBadge", { name: accountNamePreview })}
                                </Badge>
                            ) : null}
                        </div>
                        {accountFeedback ? <p className="text-sm text-[var(--gb-muted)]">{accountFeedback}</p> : null}
                        <Button type="submit" disabled={accountMutation.isPending}>
                            {accountMutation.isPending ? t("actions.saving") : t("actions.saveAccount")}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                <CardHeader className="px-5 pt-5 md:px-6">
                    <CardTitle className="text-base text-[var(--gb-text)]">{t("language.label")}</CardTitle>
                    <CardDescription>{t("language.description")}</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                    <Select value={locale} onValueChange={(value) => setLocale(value as AppLocale)}>
                        <SelectTrigger className="w-full max-w-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">{t("language.en")}</SelectItem>
                            <SelectItem value="fr">{t("language.fr")}</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                <CardHeader className="px-5 pt-5 md:px-6">
                    <CardTitle className="text-base text-[var(--gb-text)]">{t("settings.contact.title")}</CardTitle>
                    <CardDescription>{t("settings.contact.description")}</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                    <form
                        className="space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            setProfileFeedback(null);
                            const run = async () => {
                                try {
                                    await profileMutation.mutateAsync({
                                        phone: profileForm.phone.trim() || undefined,
                                        location: profileForm.location.trim() || undefined,
                                    });
                                } catch (error) {
                                    setProfileFeedback(handleApiError(error, t("settings.contact.updateError")));
                                }
                            };
                            void run();
                        }}>
                        <Input
                            value={profileForm.phone}
                            onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
                            placeholder={t("settings.contact.phonePlaceholder")}
                        />
                        <Input
                            value={profileForm.location}
                            onChange={(event) => setProfileForm((prev) => ({ ...prev, location: event.target.value }))}
                            placeholder={t("settings.contact.locationPlaceholder")}
                        />
                        {profileQuery.isPending ? (
                            <p className="text-sm text-[var(--gb-muted)]">{t("settings.contact.loading")}</p>
                        ) : null}
                        {profileFeedback ? <p className="text-sm text-[var(--gb-muted)]">{profileFeedback}</p> : null}
                        <Button type="submit" disabled={profileMutation.isPending}>
                            {profileMutation.isPending ? t("actions.saving") : t("actions.saveContactProfile")}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                <CardHeader className="px-5 pt-5 md:px-6">
                    <CardTitle className="text-base text-[var(--gb-text)]">{t("settings.security.title")}</CardTitle>
                    <CardDescription>
                        {hasPasswordCredentials
                            ? t("settings.security.changePasswordDescription")
                            : t("settings.security.setPasswordDescription")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                    <form
                        className="space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            setPasswordFeedback(null);
                            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                                setPasswordFeedback(t("settings.security.passwordMismatch"));
                                return;
                            }
                            const run = async () => {
                                try {
                                    await passwordMutation.mutateAsync({
                                        currentPassword: hasPasswordCredentials ? passwordForm.currentPassword : undefined,
                                        newPassword: passwordForm.newPassword,
                                    });
                                } catch (error) {
                                    setPasswordFeedback(
                                        handleApiError(
                                            error,
                                            hasPasswordCredentials
                                                ? t("settings.security.changePasswordError")
                                                : t("settings.security.setPasswordError"),
                                        ),
                                    );
                                }
                            };
                            void run();
                        }}>
                        {hasPasswordCredentials ? (
                            <Input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(event) =>
                                    setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                                }
                                placeholder={t("settings.security.currentPasswordPlaceholder")}
                                required
                            />
                        ) : null}
                        <Input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                            placeholder={t("settings.security.newPasswordPlaceholder")}
                            required
                        />
                        <Input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(event) =>
                                setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                            }
                            placeholder={t("settings.security.confirmPasswordPlaceholder")}
                            required
                        />
                        {passwordFeedback ? <p className="text-sm text-[var(--gb-muted)]">{passwordFeedback}</p> : null}
                        <Button type="submit" disabled={passwordMutation.isPending}>
                            {passwordMutation.isPending
                                ? t("actions.updating")
                                : hasPasswordCredentials
                                  ? t("settings.security.changePassword")
                                  : t("settings.security.setPassword")}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                <CardHeader className="px-5 pt-5 md:px-6">
                    <CardTitle className="text-base text-[var(--gb-text)]">{t("settings.providers.title")}</CardTitle>
                    <CardDescription>{t("settings.providers.description")}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 px-5 pb-5 md:grid-cols-2 md:px-6 md:pb-6">
                    {CONNECTABLE_PROVIDERS.map((providerItem) => {
                        const isConnected = connectedProviders.has(providerItem.provider);
                        const providerLabel = t(`settings.providers.${providerItem.provider}`);
                        return (
                            <button
                                key={providerItem.provider}
                                type="button"
                                disabled={isConnected}
                                className={cn(
                                    PROVIDER_BUTTON_BASE,
                                    isConnected
                                        ? (providerItem.connectedClassName ?? CONNECTED_PROVIDER_BUTTON)
                                        : providerItem.disconnectClassName,
                                )}>
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center">{providerItem.icon}</span>
                                {isConnected ? (
                                    providerItem.provider === "google" ? (
                                        <>
                                            <span className="min-w-0 flex-1 text-left">
                                                {t("settings.providers.connected", { provider: providerLabel })}
                                            </span>
                                            <span
                                                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500"
                                                aria-hidden>
                                                <CheckCircle2 className="h-4 w-4" />
                                            </span>
                                        </>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5">
                                            <CheckCircle2
                                                className="h-4 w-4 shrink-0 text-white dark:text-emerald-50"
                                                aria-hidden
                                            />
                                            <span>{t("settings.providers.connected", { provider: providerLabel })}</span>
                                        </span>
                                    )
                                ) : (
                                    <span>{t("settings.providers.connect", { provider: providerLabel })}</span>
                                )}
                            </button>
                        );
                    })}
                </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-[var(--gb-app-panel-bg)]">
                <CardHeader className="px-5 pt-5 md:px-6">
                    <CardTitle className="text-base text-red-400">{t("settings.dangerZone.title")}</CardTitle>
                    <CardDescription>{t("settings.dangerZone.description")}</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                    <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
                        {t("settings.dangerZone.deleteAccount")}
                    </Button>
                </CardContent>
            </Card>

            <Dialog
                open={deleteOpen}
                onOpenChange={(open) => {
                    setDeleteOpen(open);
                    if (!open) {
                        setDeleteFeedback(null);
                        setDeleteForm({ password: "", confirmText: "" });
                    }
                }}>
                <DialogContent showCloseButton={false} className="flex flex-col gap-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{t("settings.deleteDialog.title")}</DialogTitle>
                        <DialogDescription>
                            {t("settings.deleteDialog.descriptionPrefix", { phrase: ACCOUNT_DELETE_PHRASE })}
                            {requiresPasswordForDelete
                                ? ` ${t("settings.deleteDialog.descriptionSuffixPasswordRequired")}`
                                : null}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Input
                            value={deleteForm.confirmText}
                            onChange={(event) =>
                                setDeleteForm((prev) => ({ ...prev, confirmText: event.target.value }))
                            }
                            placeholder={ACCOUNT_DELETE_PHRASE}
                        />
                        {requiresPasswordForDelete ? (
                            <Input
                                type="password"
                                value={deleteForm.password}
                                onChange={(event) =>
                                    setDeleteForm((prev) => ({ ...prev, password: event.target.value }))
                                }
                                placeholder={t("settings.deleteDialog.passwordRequiredPlaceholder")}
                                required
                            />
                        ) : null}
                        {deleteFeedback ? <p className="text-sm text-red-300">{deleteFeedback}</p> : null}
                    </div>

                    <DialogFooter className="gap-3">
                        <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteMutation.isPending}>
                            {t("actions.cancel")}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                                setDeleteFeedback(null);
                                if (deleteForm.confirmText.trim() !== ACCOUNT_DELETE_PHRASE) {
                                    setDeleteFeedback(
                                        t("settings.deleteDialog.confirmPhraseError", { phrase: ACCOUNT_DELETE_PHRASE }),
                                    );
                                    return;
                                }
                                if (requiresPasswordForDelete && !deleteForm.password) {
                                    setDeleteFeedback(t("settings.deleteDialog.passwordRequiredError"));
                                    return;
                                }
                                const run = async () => {
                                    try {
                                        await deleteMutation.mutateAsync({
                                            password: deleteForm.password.trim() || undefined,
                                        });
                                    } catch (error) {
                                        setDeleteFeedback(handleApiError(error, t("settings.deleteDialog.deleteError")));
                                    }
                                };
                                void run();
                            }}>
                            {deleteMutation.isPending ? t("actions.deleting") : t("actions.deletePermanently")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
