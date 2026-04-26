interface StepFooterProps {
    onSkip: () => void;
    onContinue: () => void;
    canContinue: boolean;
    skipLabel?: string;
    continueLabel?: string;
}

export function StepFooter({
    onSkip,
    onContinue,
    canContinue,
    skipLabel = "Skip for now",
    continueLabel = "Continue →",
}: StepFooterProps) {
    return (
        <div className="ob-step-footer">
            <button type="button" className="ob-btn-skip" onClick={onSkip}>
                {skipLabel}
            </button>

            <button type="button" className="ob-btn-continue" onClick={onContinue} disabled={!canContinue}>
                {continueLabel}
            </button>
        </div>
    );
}
