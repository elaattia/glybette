import "@/styles/home/pricing.css";
import { useTranslation } from "react-i18next";

const ESSENTIAL_FEATURE_KEYS = [
    "cvProfile",
    "opportunities",
    "portfolio",
    "tracking",
    "insights",
    "community",
] as const;

const PROFESSIONAL_FEATURE_KEYS = [
    "optimization",
    "unlimitedOpportunities",
    "recommendations",
    "visibility",
    "interviewPractice",
    "courses",
    "portfolioCustomization",
    "fullTracking",
] as const;

function Check() {
    return (
        <div className="gb-check">
            <svg viewBox="0 0 12 10">
                <polyline points="1,5 4,8 11,1" />
            </svg>
        </div>
    );
}

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
            { threshold: 0.06, rootMargin: "0px 0px -60px 0px" },
        );
        io.observe(el);
    };
}

export default function Pricing() {
    const { t } = useTranslation("landing");
    const reveal = useReveal();

    return (
        <section id="pricing">
            <div className="gb-pricing" ref={reveal}>
                <div className="gb-pricing-header">
                    <div className="gb-sec-label">{t("pricing.label")}</div>
                    <h2>{t("pricing.title")}</h2>
                    <p>{t("pricing.subtitle")}</p>
                </div>
                <div className="gb-pricing-grid">
                    <div className="gb-pcard">
                        <div className="gb-plan-name">{t("pricing.essential.name")}</div>
                        <div className="gb-plan-price">
                            <span className="amt">{t("pricing.essential.price")}</span>
                            <span className="cur">{t("pricing.essential.currency")}</span>
                            <span className="per">{t("pricing.essential.period")}</span>
                        </div>
                        <p className="gb-plan-desc">{t("pricing.essential.description")}</p>
                        <ul className="gb-plan-feats">
                            {ESSENTIAL_FEATURE_KEYS.map((key) => (
                                <li key={key}>
                                    <Check />
                                    {t(`pricing.essential.features.${key}`)}
                                </li>
                            ))}
                        </ul>
                        <a href="/onboarding" className="gb-btn-plan outline">
                            {t("pricing.essential.cta")}
                        </a>
                    </div>
                    <div className="gb-pcard featured">
                        <div className="gb-popular-badge">{t("pricing.professional.badge")}</div>
                        <div className="gb-plan-name">{t("pricing.professional.name")}</div>
                        <div className="gb-plan-price">
                            <span className="amt">{t("pricing.professional.price")}</span>
                            <span className="cur">{t("pricing.professional.currency")}</span>
                            <span className="per">{t("pricing.professional.period")}</span>
                        </div>
                        <p className="gb-plan-desc">{t("pricing.professional.description")}</p>
                        <ul className="gb-plan-feats">
                            {PROFESSIONAL_FEATURE_KEYS.map((key) => (
                                <li key={key}>
                                    <Check />
                                    {t(`pricing.professional.features.${key}`)}
                                </li>
                            ))}
                        </ul>
                        <a href="/onboarding?plan=pro" className="gb-btn-plan filled">
                            {t("pricing.professional.cta")}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
