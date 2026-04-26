import "@/styles/onboarding/onboarding.css";
import { useState, type CSSProperties } from "react";
import { X } from "lucide-react";

interface OnboardingLayoutProps {
    currentStep: number;
    totalSteps: number;
    progress: number;
    showBack?: boolean;
    onBack?: () => void;
    children: React.ReactNode;
}

export function OnboardingLayout({
    currentStep,
    totalSteps,
    progress,
    showBack = false,
    onBack,
    children,
}: OnboardingLayoutProps) {
    const [showWhyMatters, setShowWhyMatters] = useState(false);

    return (
        <div className="ob-root">
            <div className="ob-header">
                <div className="ob-header-row">
                    <span className="ob-kicker">
                        STEP <strong>{String(currentStep).padStart(2, "0")}</strong> of{" "}
                        {String(totalSteps).padStart(2, "0")}
                    </span>
                    <span className="ob-kicker">{progress}% COMPLETE</span>
                </div>
                <div className="ob-progress-track" style={{ "--ob-progress": `${progress}%` } as CSSProperties}>
                    <div className="ob-progress-fill" />
                </div>
            </div>

            <div className="ob-main">
                <div className="ob-card">
                    {showBack && (
                        <div className="ob-back-wrap">
                            <button type="button" className="ob-back-btn" onClick={onBack}>
                                ← Back
                            </button>
                        </div>
                    )}

                    <div className={showBack ? "ob-card-body--with-back" : "ob-card-body"}>{children}</div>
                </div>
            </div>

            <div className="ob-footer-actions">
                <button type="button" className="ob-why-wrap" onClick={() => setShowWhyMatters(true)}>
                    <span className="ob-why-icon">?</span>
                    Why this matters
                </button>
            </div>

            {showWhyMatters && (
                <div
                    className="ob-modal-backdrop"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ob-why-title"
                    onClick={() => setShowWhyMatters(false)}>
                    <div className="ob-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ob-modal-head">
                            <h3 id="ob-why-title" className="ob-modal-title">
                                Why this matters
                            </h3>
                            <button
                                type="button"
                                className="ob-modal-close"
                                onClick={() => setShowWhyMatters(false)}
                                aria-label="Close">
                                <X className="w-[18px] h-[18px]" />
                            </button>
                        </div>
                        <p className="ob-modal-body">
                            We ask a few questions to better understand you. This helps us personalize your profile and
                            recommend opportunities that match your interests and goals.
                        </p>
                        <p className="ob-modal-body">
                            Since our platform supports different types of users, this information allows us to show the
                            most relevant opportunities first, so you can quickly find what you're looking for.
                        </p>
                        <button type="button" className="ob-modal-primary" onClick={() => setShowWhyMatters(false)}>
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
