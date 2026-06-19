import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Sparkles, LayoutDashboard, Briefcase, FileText, Shield } from "lucide-react";

interface Props {
    name: string;
    domain?: string;
    lookingFor?: string[];
    onFinish?: () => void;
}

const FEATURE_KEYS = ["dashboard", "opportunities", "cvTemplate"] as const;

export function StepComplete({ name, domain, lookingFor, onFinish }: Props) {
    const { t } = useTranslation("onboarding");
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    const handleFinish = useCallback(() => {
        onFinish?.();
        navigate("/app/dashboard");
    }, [navigate, onFinish]);

    useEffect(() => {
        if (countdown <= 0) {
            handleFinish();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((c) => c - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, handleFinish]);

    const profileSummaryParts = [
        name,
        domain,
        lookingFor && lookingFor.length > 0
            ? t("complete.profileSummaryLookingFor", { opportunity: lookingFor[0] })
            : null,
    ].filter(Boolean);

    const profileSummary = profileSummaryParts.join(" · ");

    const featureIcons = [
        <LayoutDashboard className="w-4 h-4" />,
        <Briefcase className="w-4 h-4" />,
        <FileText className="w-4 h-4" />,
    ];
    const featureIconBgVars = [
        "var(--ob-icon-bg-blue)",
        "var(--ob-icon-bg-green)",
        "var(--ob-icon-bg-purple)",
    ];
    const featureIconColorVars = [
        "var(--ob-icon-blue)",
        "var(--ob-icon-green)",
        "var(--ob-icon-purple)",
    ];

    return (
        <div className="ob-complete-root">
            <div className="ob-complete-icon-circle">
                <Sparkles className="w-8 h-8 text-white" />
            </div>

            <div className="ob-complete-intro">
                <h1 className="ob-complete-h1 text-4xl font-bold">{t("complete.title")}</h1>

                {domain && profileSummary && (
                    <div className="ob-complete-chip inline-flex items-center gap-2 rounded-full shadow-sm">
                        <Briefcase className="w-3.5 h-3.5 text-[var(--ob-text-secondary)]" />
                        <span className="text-sm">{profileSummary}</span>
                    </div>
                )}
            </div>

            <div className="ob-complete-panel">
                <p className="ob-complete-panel-title text-sm font-semibold">{t("complete.preparedTitle")}</p>

                <div className="ob-complete-features">
                    {FEATURE_KEYS.map((key, index) => (
                        <div key={key} className="ob-complete-feature-row">
                            <div
                                className="ob-complete-feature-icon rounded-lg flex items-center justify-center"
                                style={{
                                    background: featureIconBgVars[index],
                                    color: featureIconColorVars[index],
                                }}>
                                {featureIcons[index]}
                            </div>
                            <div className="ob-complete-feature-body">
                                <p className="ob-complete-feature-name text-sm font-semibold">
                                    {t(`complete.features.${key}.title`)}
                                </p>
                                <p className="ob-complete-feature-desc text-xs">
                                    {t(`complete.features.${key}.description`)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ob-complete-actions">
                <button
                    type="button"
                    onClick={handleFinish}
                    className="ob-complete-launch w-full text-white font-semibold text-base transition-all hover:scale-[1.02] hover:shadow-xl shadow-lg flex items-center justify-center gap-2">
                    {t("complete.launch")}
                </button>

                <p className="ob-complete-countdown text-xs">
                    {t("complete.countdown", {
                        count: countdown,
                        plural: countdown !== 1 ? "s" : "",
                    })}
                </p>
            </div>

            <div className="ob-complete-trust flex items-center gap-1.5 text-xs">
                <Shield className="w-3.5 h-3.5" />
                {t("complete.trust")}
            </div>
        </div>
    );
}
