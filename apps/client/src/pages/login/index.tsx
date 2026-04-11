import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginCard } from "@/components/auth/LoginCard";
import { AuthButton } from "@/components/auth/AuthButton";
import { GoogleIcon, LinkedInIcon, GitHubIcon } from "@/components/auth/AuthProviderIcons";
import "./login.css";

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
                error={errorMessage}
            >
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
                
                <AuthButton
                    disabled
                    icon={<LinkedInIcon />}
                    label="Continue with LinkedIn"
                    variant="linkedin"
                />
                
                <AuthButton
                    disabled
                    icon={<GitHubIcon />}
                    label="Continue with GitHub"
                    variant="github"
                />
            </LoginCard>
        </main>
    );
}
