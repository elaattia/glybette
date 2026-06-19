import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { useUser } from "@/hooks/useUser";
import { resolveAuthenticatedDestination } from "@/lib/auth-return-path";
import { LoginCard } from "@/components/auth/LoginCard";
import { AuthButton } from "@/components/auth/AuthButton";
import { GoogleIcon, LinkedInIcon, GitHubIcon } from "@/components/auth/AuthProviderIcons";
import { ApiError } from "@/lib/api";
import "./login.css";

export default function LoginPage() {
    const { t } = useTranslation("auth");
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const auth = useAuth();
    const verification = useEmailVerification();
    const { user } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const errorCode = searchParams.get("error");
    const errorMessage = errorCode
        ? t(`login.errors.${errorCode}`, { defaultValue: t("login.signInFailed") })
        : null;

    if (auth.isAuthenticated && verification.isPending) {
        return null;
    }

    if (auth.isAuthenticated) {
        if (verification.requiresEmailVerification) {
            return <Navigate to="/verify-email" replace />;
        }
        const from = (location.state as { from?: string } | null)?.from;
        return <Navigate to={resolveAuthenticatedDestination(from, user)} replace />;
    }

    return (
        <main className="login-page">
            {/* Floating orbs */}
            <div className="login-orb login-orb-1" />
            <div className="login-orb login-orb-2" />
            <div className="login-orb login-orb-3" />

            {/* Grid overlay */}
            <div className="login-grid" />

            <LoginCard
                title={
                    <>
                        {t("login.titlePrefix")}{" "}
                        <span className="gradient-text">{t("login.titleBrand")}</span>
                    </>
                }
                subtitle={t("login.subtitle")}
                error={errorMessage}>
                <AuthButton
                    onClick={() => {
                        void auth.startGoogleSignIn();
                    }}
                    disabled={auth.isChecking}
                    isLoading={auth.isChecking}
                    icon={<GoogleIcon />}
                    label={t("login.continueWithGoogle")}
                    variant="google"
                />
                <form
                    className="login-password-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        setPasswordError(null);

                        const run = async () => {
                            try {
                                await auth.startEmailPasswordSignIn(email.trim(), password);
                            } catch (error) {
                                const message =
                                    error instanceof ApiError ? error.message : t("login.emailPasswordError");
                                setPasswordError(message);
                            }
                        };
                        void run();
                    }}>
                    <input
                        type="email"
                        autoComplete="email"
                        placeholder={t("login.emailPlaceholder")}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="login-input"
                        required
                    />
                    <input
                        type="password"
                        autoComplete="current-password"
                        placeholder={t("login.passwordPlaceholder")}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="login-input"
                        required
                    />
                    <button type="submit" className="login-primary-button" disabled={auth.isChecking}>
                        {auth.isChecking ? t("login.signingIn") : t("login.continueWithEmail")}
                    </button>
                </form>
                {passwordError && <p className="login-password-error">{passwordError}</p>}

                <AuthButton
                    disabled
                    icon={<LinkedInIcon />}
                    label={t("login.continueWithLinkedIn")}
                    variant="linkedin"
                />

                <AuthButton disabled icon={<GitHubIcon />} label={t("login.continueWithGitHub")} variant="github" />
            </LoginCard>
        </main>
    );
}
