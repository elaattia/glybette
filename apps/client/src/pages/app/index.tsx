import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";

export default function ProtectedAppPage() {
    const auth = useAuth();
    const userQuery = useUser();

    return (
        <main className="min-h-screen px-6 py-10">
            <div className="mx-auto grid w-full max-w-5xl gap-5">
                <section className="rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-6">
                    <h1 className="font-['Bricolage_Grotesque'] text-3xl font-bold text-[var(--gb-text)]">
                        Protected test page
                    </h1>
                    <p className="mt-2 text-sm text-[var(--gb-muted)]">
                        This route is guarded and confirms the end-to-end auth flow.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            className="gb-btn-secondary"
                            onClick={() => {
                                void userQuery.refetch();
                            }}
                        >
                            Refresh profile
                        </button>
                        <button
                            className="gb-btn-primary"
                            disabled={auth.logoutMutation.isPending}
                            onClick={() => {
                                void auth.logout();
                            }}
                        >
                            {auth.logoutMutation.isPending ? "Signing out..." : "Sign out"}
                        </button>
                    </div>
                </section>

                <section className="rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-6">
                    <h2 className="text-lg font-semibold text-[var(--gb-text)]">Session state</h2>
                    <dl className="mt-3 grid gap-2 text-sm text-[var(--gb-text-off)]">
                        <div>
                            <dt className="text-[var(--gb-muted)]">Status</dt>
                            <dd>{auth.status}</dd>
                        </div>
                        <div>
                            <dt className="text-[var(--gb-muted)]">Bootstrapped</dt>
                            <dd>{String(auth.bootstrapped)}</dd>
                        </div>
                        <div>
                            <dt className="text-[var(--gb-muted)]">Session</dt>
                            <dd>{auth.session ? "active" : "missing"}</dd>
                        </div>
                        <div>
                            <dt className="text-[var(--gb-muted)]">User email</dt>
                            <dd>{auth.user?.email ?? "Unavailable"}</dd>
                        </div>
                    </dl>
                </section>

                <section className="rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-6">
                    <h2 className="text-lg font-semibold text-[var(--gb-text)]">/api/users/me</h2>
                    <div className="mt-3 text-sm text-[var(--gb-text-off)]">
                        {userQuery.isLoading ? (
                            <p className="text-[var(--gb-muted)]">Loading user profile...</p>
                        ) : userQuery.user ? (
                            <dl className="grid gap-2">
                                <div>
                                    <dt className="text-[var(--gb-muted)]">Display name</dt>
                                    <dd>{userQuery.user.displayName}</dd>
                                </div>
                                <div>
                                    <dt className="text-[var(--gb-muted)]">Email</dt>
                                    <dd>{userQuery.user.email ?? "Not provided"}</dd>
                                </div>
                                <div>
                                    <dt className="text-[var(--gb-muted)]">Provider</dt>
                                    <dd>{userQuery.user.provider}</dd>
                                </div>
                                <div>
                                    <dt className="text-[var(--gb-muted)]">Roles</dt>
                                    <dd>{userQuery.user.roles.join(", ") || "No roles"}</dd>
                                </div>
                            </dl>
                        ) : (
                            <p className="text-[var(--gb-muted)]">No user data is available yet.</p>
                        )}
                    </div>
                    {userQuery.isError ? (
                        <p className="mt-4 rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                            Failed to load the protected user profile.
                        </p>
                    ) : null}
                </section>
            </div>
        </main>
    );
}
