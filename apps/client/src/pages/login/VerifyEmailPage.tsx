import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { useUser } from "@/hooks/useUser";
import { resolveAuthenticatedDestination } from "@/lib/auth-return-path";
import { ApiError } from "@/lib/api";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import "./login.css";

type VerifyEmailPageProps = {
    /** Mock/preview route: keep showing the page even when email is already verified. */
    skipVerifiedRedirect?: boolean;
};

export function VerifyEmailPage({ skipVerifiedRedirect = false }: VerifyEmailPageProps = {}) {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    const verification = useEmailVerification();
    const { user } = useUser();
    const [code, setCode] = useState("");
    const [requestMessage, setRequestMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isSubmitting = verification.requestOtpMutation.isPending || verification.verifyOtpMutation.isPending;

    const maskedEmail = useMemo(() => {
        if (!verification.email) {
            return t("verifyEmail.fallbackEmail");
        }
        const [name, domain] = verification.email.split("@");
        if (!name || !domain) {
            return verification.email;
        }
        const visible = name.slice(0, 2);
        return `${visible}${"*".repeat(Math.max(1, name.length - visible.length))}@${domain}`;
    }, [t, verification.email]);

    useEffect(() => {
        if (!auth.isAuthenticated || verification.isPending || verification.isError) {
            return;
        }

        if (!skipVerifiedRedirect && !verification.requiresEmailVerification) {
            const from = (location.state as { from?: string } | null)?.from;
            navigate(resolveAuthenticatedDestination(from, user), { replace: true });
        }
    }, [
        auth.isAuthenticated,
        location.state,
        navigate,
        skipVerifiedRedirect,
        user,
        verification.isError,
        verification.isPending,
        verification.requiresEmailVerification,
    ]);

    if (auth.isChecking || (auth.isAuthenticated && verification.isPending)) {
        return (
            <main className="min-h-screen flex items-center justify-center px-6">
                <div className="w-full max-w-md rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-6 text-center">
                    <p className="text-sm text-[var(--gb-muted)]">{t("verifyEmail.preparing")}</p>
                </div>
            </main>
        );
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const submitCode = async () => {
        setErrorMessage(null);
        setRequestMessage(null);
        try {
            await verification.verifyOtp(code.trim());
            if (!skipVerifiedRedirect) {
                const from = (location.state as { from?: string } | null)?.from;
                navigate(resolveAuthenticatedDestination(from, user), { replace: true });
            }
        } catch (error) {
            const message = error instanceof ApiError ? error.message : t("verifyEmail.verifyError");
            setErrorMessage(message);
        }
    };

    const resendCode = async () => {
        setErrorMessage(null);
        try {
            const response = await verification.requestOtp();
            setRequestMessage(t("verifyEmail.codeSent", { seconds: response.expiresInSeconds }));
        } catch (error) {
            const message = error instanceof ApiError ? error.message : t("verifyEmail.resendError");
            setErrorMessage(message);
        }
    };

    return (
        <main className="login-page">
            <div className="login-orb login-orb-1" />
            <div className="login-orb login-orb-2" />
            <div className="login-orb login-orb-3" />
            <div className="login-grid" />

            <div className="login-card-wrapper max-w-[560px]">
                <div className="login-card">
                    <div className="login-card-content">
                        <div className="login-header">
                            <p className="gb-sec-label mb-2">{t("verifyEmail.label")}</p>
                            <h1 className="login-title">{t("verifyEmail.title")}</h1>
                            <p className="login-subtitle">{t("verifyEmail.subtitle", { email: maskedEmail })}</p>
                        </div>

                        {errorMessage && (
                            <p className="mt-4 rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
                                {errorMessage}
                            </p>
                        )}
                        {requestMessage && (
                            <p className="mt-4 rounded-md border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                                {requestMessage}
                            </p>
                        )}

                        <div className="mt-6 space-y-4">
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    value={code}
                                    onChange={setCode}
                                    disabled={isSubmitting}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    void submitCode();
                                }}
                                disabled={code.trim().length !== 6 || isSubmitting}
                                className="login-primary-button">
                                {verification.verifyOtpMutation.isPending
                                    ? t("verifyEmail.verifying")
                                    : t("verifyEmail.verifyButton")}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    void resendCode();
                                }}
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-[var(--gb-border)] px-4 py-3 font-medium text-[var(--gb-text)] transition hover:bg-[var(--gb-surface2)] disabled:cursor-not-allowed disabled:opacity-50">
                                {verification.requestOtpMutation.isPending
                                    ? t("verifyEmail.sending")
                                    : t("verifyEmail.resendCode")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
