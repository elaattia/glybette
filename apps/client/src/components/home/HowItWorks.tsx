import "@/styles/home/how-it-works.css";
import { useTranslation } from "react-i18next";
import { User, Sparkles, Rocket, ArrowRight } from "lucide-react";

const STEP_KEYS = ["profile", "prepare", "apply"] as const;

const STEP_ICONS = [
    <User className="w-6 h-6" />,
    <Sparkles className="w-6 h-6" />,
    <Rocket className="w-6 h-6" />,
];

function useReveal() {
    return (el: HTMLElement | null) => {
        if (!el) return;
        el.classList.add("gb-reveal");
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    el.classList.add("visible");
                    io.disconnect();
                }
            },
            { threshold: 0.08, rootMargin: "0px 0px -60px 0px" },
        );
        io.observe(el);
    };
}

export default function HowItWorks() {
    const { t } = useTranslation("landing");
    const reveal = useReveal();

    return (
        <section id="how-it-works">
            <div className="gb-hiw" ref={reveal}>
                <div className="gb-hiw-header">
                    <div className="gb-sec-label">{t("howItWorks.label")}</div>
                    <h2>
                        {t("howItWorks.titleLine1")}
                        <br />
                        {t("howItWorks.titleLine2")}
                    </h2>
                    <p>{t("howItWorks.subtitle")}</p>
                </div>
                <div className="gb-steps">
                    {STEP_KEYS.map((key, index) => {
                        const num = t(`howItWorks.steps.${key}.num`);
                        return (
                            <div key={key} className="gb-step">
                                <div className="gb-step-bg-num">{num}</div>
                                <div className="gb-step-icon">{STEP_ICONS[index]}</div>
                                <div className="gb-step-n">{t("howItWorks.stepPrefix", { num })}</div>
                                <h3>{t(`howItWorks.steps.${key}.title`)}</h3>
                                <p>{t(`howItWorks.steps.${key}.description`)}</p>
                            </div>
                        );
                    })}
                </div>
                <div className="gb-hiw-cta">
                    <a href="/onboarding" className="gb-btn-primary-sm">
                        {t("howItWorks.startNow")} <ArrowRight className="w-4 h-4 inline ml-1" />
                    </a>
                </div>
            </div>
        </section>
    );
}
