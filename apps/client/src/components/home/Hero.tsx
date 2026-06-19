import "@/styles/home/hero.css";
import { useTranslation } from "react-i18next";
import { Sparkles, Target, Briefcase, Zap, ArrowRight, ArrowDown } from "lucide-react";

const CARD_KEYS = ["accuracy", "opportunities", "matching"] as const;

export default function Hero() {
    const { t } = useTranslation("landing");

    return (
        <section className="gb-hero">
            <div className="gb-orb gb-orb-1" />
            <div className="gb-orb gb-orb-2" />
            <div className="gb-orb gb-orb-3" />
            <div className="gb-hero-grid" />
            <div className="gb-hero-inner">
                <div className="gb-hero-badge">
                    <div className="gb-badge-dot">
                        <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    {t("hero.badge")}
                </div>
                <h1>
                    {t("hero.titleLine1")}
                    <br />
                    <span className="grad">{t("hero.titleHighlight")}</span>
                    <br />
                    <span className="text-stroke">{t("hero.titleLine3")}</span>
                </h1>
                <h3>{t("hero.tagline")}</h3>
                <p className="gb-hero-sub">{t("hero.subtitle")}</p>
                <div className="gb-hero-cta">
                    <a href="/onboarding" className="gb-btn-primary">
                        {t("hero.buildProfile")} <ArrowRight className="w-4 h-4 inline ml-1" />
                    </a>
                    <a href="#features" className="gb-btn-secondary">
                        {t("hero.exploreFeatures")} <ArrowDown className="w-4 h-4 inline ml-1" />
                    </a>
                </div>
                <div className="gb-hero-cards">
                    {CARD_KEYS.map((key, index) => {
                        const icons = [
                            <Target key="target" className="w-5 h-5 text-green-500" />,
                            <Briefcase key="briefcase" className="w-5 h-5 text-blue-500" />,
                            <Zap key="zap" className="w-5 h-5 text-purple-500" />,
                        ];
                        const iconClasses = ["green", "blue", "purp"];

                        return (
                            <div key={key} className="gb-hcard">
                                <div className={`gb-hcard-icon ${iconClasses[index]}`}>{icons[index]}</div>
                                <div>
                                    <div className="gb-hcard-label">{t(`hero.cards.${key}.label`)}</div>
                                    <div className="gb-hcard-value">{t(`hero.cards.${key}.value`)}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
