import "@/styles/home/testimonials.css";
import { useTranslation } from "react-i18next";

const TESTIMONIAL_KEYS = ["yasmine", "mohamed", "ines"] as const;

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

export default function Testimonials() {
    const { t } = useTranslation("landing");
    const reveal = useReveal();

    return (
        <section id="testimonials">
            <div className="gb-testimonials" ref={reveal}>
                <div className="gb-test-header">
                    <div className="gb-sec-label">{t("testimonials.label")}</div>
                    <h2>
                        {t("testimonials.titleLine1")}
                        <br />
                        {t("testimonials.titleLine2")}
                    </h2>
                    <p>{t("testimonials.subtitle")}</p>
                </div>
                <div className="gb-test-grid">
                    {TESTIMONIAL_KEYS.map((key) => (
                        <div key={key} className="gb-tcard">
                            <div className="gb-stars">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="gb-star" />
                                ))}
                            </div>
                            <p className="gb-tcard-text">"{t(`testimonials.items.${key}.text`)}"</p>
                            <div className="gb-tcard-author">
                                <div className="gb-tcard-avatar">{t(`testimonials.items.${key}.initials`)}</div>
                                <div>
                                    <div className="gb-tcard-name">{t(`testimonials.items.${key}.name`)}</div>
                                    <div className="gb-tcard-role">{t(`testimonials.items.${key}.role`)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
