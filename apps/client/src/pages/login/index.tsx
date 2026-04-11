import { Navigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const errorMessages: Record<string, string> = {
    callback_failed: "Google sign-in completed but no active session was found. Please try again.",
};

export default function LoginPage() {
    const [searchParams] = useSearchParams();
    const auth = useAuth();
    const errorCode = searchParams.get("error");
    const errorMessage = errorCode ? errorMessages[errorCode] ?? "Sign-in failed." : null;

    if (auth.isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(22,163,74,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(2,132,199,0.18),transparent_40%)] px-6 py-10">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
                <section className="grid w-full gap-6 rounded-3xl border border-[var(--gb-border)] bg-[var(--gb-surface)]/85 p-8 shadow-2xl backdrop-blur md:grid-cols-[1.1fr_1fr] md:p-12">
                    <div className="space-y-6">
                        <p className="gb-sec-label mb-0">Sign in</p>
                        <h1 className="font-['Bricolage_Grotesque'] text-4xl font-extrabold leading-tight text-[var(--gb-text)] md:text-5xl">
                            Continue to your <span className="gb-grad-text">Glybette workspace</span>
                        </h1>
                        <p className="text-base text-[var(--gb-muted)]">
                            Authentication uses Better Auth browser sessions and a protected
                            gateway endpoint. No browser-stored JWT is required.
                        </p>
                        <ul className="space-y-3 text-sm text-[var(--gb-text-off)]">
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                Google OAuth via `/api/auth/*`
                            </li>
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                Session cookie checked before protected routes
                            </li>
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                Profile loaded from `/api/users/me`
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-[var(--gb-border2)] bg-[var(--gb-bg3)]/70 p-6">
                        <h2 className="mb-2 text-lg font-semibold text-[var(--gb-text)]">Auth status</h2>
                        <p className="text-sm text-[var(--gb-muted)]">
                            Current status: <span className="font-medium text-[var(--gb-text)]">{auth.status}</span>
                        </p>
                        <p className="mt-1 text-sm text-[var(--gb-muted)]">
                            Bootstrapped:{" "}
                            <span className="font-medium text-[var(--gb-text)]">{String(auth.bootstrapped)}</span>
                        </p>

                        {errorMessage ? (
                            <p className="mt-4 rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                                {errorMessage}
                            </p>
                        ) : null}

                        <button
                            className="gb-btn-primary mt-6 w-full justify-center"
                            disabled={auth.isChecking}
                            onClick={() => {
                                void auth.startGoogleSignIn();
                            }}
                        >
                            {auth.isChecking ? "Checking session..." : "Continue with Google"}
                            <ArrowRight className="gb-arr h-4 w-4" />
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}
