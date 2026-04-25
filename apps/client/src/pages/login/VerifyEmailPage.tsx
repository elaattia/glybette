import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { ApiError } from "@/lib/api";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import "./login.css";

export function VerifyEmailPage() {
    const navigate = useNavigate();
    const auth = useAuth();
    const verification = useEmailVerification();
    const [code, setCode] = useState("");
    const [requestMessage, setRequestMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isSubmitting =
        verification.requestOtpMutation.isPending || verification.verifyOtpMutation.isPending;

    const maskedEmail = useMemo(() => {
        if (!verification.email) {
            return "your email address";
        }
        const [name, domain] = verification.email.split("@");
        if (!name || !domain) {
            return verification.email;
        }
        const visible = name.slice(0, 2);
        return `${visible}${"*".repeat(Math.max(1, name.length - visible.length))}@${domain}`;
    }, [verification.email]);

    useEffect(() => {
        if (!auth.isAuthenticated || verification.isPending || verification.isError) {
            return;
        }

        if (!verification.requiresEmailVerification) {
            navigate("/app/dashboard", { replace: true });
        }
    }, [
        auth.isAuthenticated,
        navigate,
        verification.isError,
        verification.isPending,
        verification.requiresEmailVerification,
    ]);

    if (auth.isChecking || (auth.isAuthenticated && verification.isPending)) {
        return (
            <main className="min-h-screen flex items-center justify-center px-6">
                <div className="w-full max-w-md rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-surface)] p-6 text-center">
                    <p className="text-sm text-[var(--gb-muted)]">Preparing verification...</p>
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
            navigate("/app/dashboard", { replace: true });
        } catch (error) {
            const message =
                error instanceof ApiError ? error.message : "Unable to verify OTP code";
            setErrorMessage(message);
        }
    };

    const resendCode = async () => {
        setErrorMessage(null);
        try {
            const response = await verification.requestOtp();
            setRequestMessage(
                `A new code was sent. It expires in ${response.expiresInSeconds} seconds.`,
            );
        } catch (error) {
            const message =
                error instanceof ApiError ? error.message : "Unable to request a new OTP";
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
                            <p className="gb-sec-label mb-2">Email verification</p>
                            <h1 className="login-title">Verify your account</h1>
                            <p className="login-subtitle">
                                Enter the 6-digit code sent to{" "}
                                <span className="font-semibold text-[var(--gb-text)]">{maskedEmail}</span>.
                            </p>
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
                                    disabled={isSubmitting}
                                >
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
                                className="login-primary-button"
                            >
                                {verification.verifyOtpMutation.isPending ? "Verifying..." : "Verify email"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    void resendCode();
                                }}
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-[var(--gb-border)] px-4 py-3 font-medium text-[var(--gb-text)] transition hover:bg-[var(--gb-surface2)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {verification.requestOtpMutation.isPending ? "Sending..." : "Resend code"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
