import { useTranslation } from "react-i18next";

interface StepFooterProps {
    onSkip?: () => void;
    onContinue: () => void;
    canContinue: boolean;
    skipLabel?: string;
    continueLabel?: string;
}

export function StepFooter({
    onSkip,
    onContinue,
    canContinue,
    skipLabel,
    continueLabel,
}: StepFooterProps) {
    const { t } = useTranslation("onboarding");

    return (
        <div className="ob-step-footer">
            {onSkip ? (
                <button type="button" className="ob-btn-skip" onClick={onSkip}>
                    {skipLabel ?? t("footer.skipForNow")}
                </button>
            ) : (
                <div />
            )}

            <button type="button" className="ob-btn-continue" onClick={onContinue} disabled={!canContinue}>
                {continueLabel ?? t("footer.continue")}
            </button>
        </div>
    );
}
