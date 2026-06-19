import "@/styles/home/cta.css";
import { useTranslation } from "react-i18next";

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
            { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
        );
        io.observe(el);
    };
}

export default function CTA() {
    const { t } = useTranslation("landing");
    const reveal = useReveal();

    return (
        <div className="gb-cta-wrap" ref={reveal}>
            <div className="gb-cta-box">
                <div className="gb-cta-deco-1" />
                <div className="gb-cta-deco-2" />
                <h2>
                    {t("cta.titleLine1")}
                    <br />
                    {t("cta.titleLine2")}
                </h2>
                <p>{t("cta.subtitle")}</p>
                <div className="gb-cta-actions">
                    <a href="/onboarding" className="gb-cta-primary">
                        {t("cta.createProfile")} <span className="gb-arr">→</span>
                    </a>
                    <a href="#features" className="gb-cta-secondary">
                        {t("cta.seeFeatures")}
                    </a>
                </div>
                <p className="gb-cta-note">{t("cta.note")}</p>
            </div>
        </div>
    );
}
