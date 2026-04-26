import { useEffect, useState } from "react";
import { Sparkles, LayoutDashboard, Briefcase, FileText, Shield } from "lucide-react";

interface Props {
    name: string;
    domain?: string;
    lookingFor?: string[];
    onFinish: () => void;
}

export function StepComplete({ name, domain, lookingFor, onFinish }: Props) {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(timer);
                    onFinish();
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onFinish]);

    const profileSummary = [name, domain, lookingFor && lookingFor.length > 0 ? `looking for a ${lookingFor[0]}` : null]
        .filter(Boolean)
        .join(" · ");

    const features = [
        {
            icon: <LayoutDashboard className="w-4 h-4" />,
            iconBgVar: "var(--ob-icon-bg-blue)",
            iconColorVar: "var(--ob-icon-blue)",
            title: "Personalized Dashboard",
            desc: "Real-time tracking of your opportunities tailored to your profile.",
        },
        {
            icon: <Briefcase className="w-4 h-4" />,
            iconBgVar: "var(--ob-icon-bg-green)",
            iconColorVar: "var(--ob-icon-green)",
            title: "Recommended Opportunities",
            desc: "Curated offers that match your specific background and preferences.",
        },
        {
            icon: <FileText className="w-4 h-4" />,
            iconBgVar: "var(--ob-icon-bg-purple)",
            iconColorVar: "var(--ob-icon-purple)",
            title: "CV Template",
            desc: "A professional template optimized for your domain and target opportunities.",
        },
    ];

    return (
        <div className="ob-complete-root">
            <div className="ob-complete-icon-circle">
                <Sparkles className="w-8 h-8 text-white" />
            </div>

            <div className="ob-complete-intro">
                <h1 className="ob-complete-h1 text-4xl font-bold">All set for your journey!</h1>

                {domain && profileSummary && (
                    <div className="ob-complete-chip inline-flex items-center gap-2 rounded-full shadow-sm">
                        <Briefcase className="w-3.5 h-3.5 text-[var(--ob-text-secondary)]" />
                        <span className="text-sm">{profileSummary}</span>
                    </div>
                )}
            </div>

            <div className="ob-complete-panel">
                <p className="ob-complete-panel-title text-sm font-semibold">What we've prepared for you:</p>

                <div className="ob-complete-features">
                    {features.map((f) => (
                        <div key={f.title} className="ob-complete-feature-row">
                            <div
                                className="ob-complete-feature-icon rounded-lg flex items-center justify-center"
                                style={{ background: f.iconBgVar, color: f.iconColorVar }}>
                                {f.icon}
                            </div>
                            <div className="ob-complete-feature-body">
                                <p className="ob-complete-feature-name text-sm font-semibold">{f.title}</p>
                                <p className="ob-complete-feature-desc text-xs">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ob-complete-actions">
                <button
                    type="button"
                    onClick={onFinish}
                    className="ob-complete-launch w-full text-white font-semibold text-base transition-all hover:scale-[1.02] hover:shadow-xl shadow-lg flex items-center justify-center gap-2">
                    Launch My Experience
                </button>

                <p className="ob-complete-countdown text-xs">
                    Redirecting to your dashboard in {countdown} moment{countdown !== 1 ? "s" : ""}...
                </p>
            </div>

            <div className="ob-complete-trust flex items-center gap-1.5 text-xs">
                <Shield className="w-3.5 h-3.5" />
                Secure &amp; Personalized Account Setup
            </div>
        </div>
    );
}
