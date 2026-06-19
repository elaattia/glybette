import "@/styles/onboarding/onboarding.css";
import { useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation("onboarding");
    const [showWhyMatters, setShowWhyMatters] = useState(false);

    return (
        <div className="ob-root">
            <div className="ob-header">
                <div className="ob-header-row">
                    <span className="ob-kicker">
                        {t("layout.stepOf", {
                            current: String(currentStep).padStart(2, "0"),
                            total: String(totalSteps).padStart(2, "0"),
                        })}
                    </span>
                    <span className="ob-kicker">{t("layout.percentComplete", { progress })}</span>
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
                                {t("layout.back")}
                            </button>
                        </div>
                    )}

                    <div className={showBack ? "ob-card-body--with-back" : "ob-card-body"}>{children}</div>
                </div>
            </div>

            <div className="ob-footer-actions">
                <button type="button" className="ob-why-wrap" onClick={() => setShowWhyMatters(true)}>
                    <span className="ob-why-icon">?</span>
                    {t("layout.whyThisMatters")}
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
                                {t("layout.whyModal.title")}
                            </h3>
                            <button
                                type="button"
                                className="ob-modal-close"
                                onClick={() => setShowWhyMatters(false)}
                                aria-label={t("layout.close")}>
                                <X className="w-[18px] h-[18px]" />
                            </button>
                        </div>
                        <p className="ob-modal-body">{t("layout.whyModal.body1")}</p>
                        <p className="ob-modal-body">{t("layout.whyModal.body2")}</p>
                        <button type="button" className="ob-modal-primary" onClick={() => setShowWhyMatters(false)}>
                            {t("layout.whyModal.gotIt")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
