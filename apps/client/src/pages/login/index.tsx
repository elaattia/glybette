import { Navigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { LoginCard } from "@/components/auth/LoginCard";
import { AuthButton } from "@/components/auth/AuthButton";
import { GoogleIcon, LinkedInIcon, GitHubIcon } from "@/components/auth/AuthProviderIcons";
import { ApiError } from "@/lib/api";
import "./login.css";

const errorMessages: Record<string, string> = {
    callback_failed: "Google sign-in completed but no active session was found. Please try again.",
};

export default function LoginPage() {
    const [searchParams] = useSearchParams();
    const auth = useAuth();
    const verification = useEmailVerification();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const errorCode = searchParams.get("error");
    const errorMessage = errorCode ? (errorMessages[errorCode] ?? "Sign-in failed.") : null;

    if (auth.isAuthenticated && verification.isPending) {
        return null;
    }

    if (auth.isAuthenticated) {
        if (verification.requiresEmailVerification) {
            return <Navigate to="/verify-email" replace />;
        }
        return <Navigate to="/dashboard" replace />;
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
                        Welcome to <span className="gradient-text">Glybette</span>
                    </>
                }
                subtitle="Sign in or create an account to continue"
                error={errorMessage}>
                <AuthButton
                    onClick={() => {
                        void auth.startGoogleSignIn();
                    }}
                    disabled={auth.isChecking}
                    isLoading={auth.isChecking}
                    icon={<GoogleIcon />}
                    label="Continue with Google"
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
                                    error instanceof ApiError
                                        ? error.message
                                        : "Unable to sign in with email and password";
                                setPasswordError(message);
                            }
                        };
                        void run();
                    }}>
                    <input
                        type="email"
                        autoComplete="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="login-input"
                        required
                    />
                    <input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="login-input"
                        required
                    />
                    <button type="submit" className="login-primary-button" disabled={auth.isChecking}>
                        {auth.isChecking ? "Signing in..." : "Continue with Email"}
                    </button>
                </form>
                {passwordError && <p className="login-password-error">{passwordError}</p>}

                <AuthButton disabled icon={<LinkedInIcon />} label="Continue with LinkedIn" variant="linkedin" />

                <AuthButton disabled icon={<GitHubIcon />} label="Continue with GitHub" variant="github" />
            </LoginCard>
        </main>
    );
}
