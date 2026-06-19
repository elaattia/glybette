import "@/styles/home/stats.css";
import { useTranslation } from "react-i18next";

const STAT_KEYS = ["opportunities", "companies", "profiles", "accuracy"] as const;

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
            { threshold: 0.12 },
        );
        io.observe(el);
    };
}

export default function Stats() {
    const { t } = useTranslation("landing");
    const reveal = useReveal();

    return (
        <div className="gb-stats" ref={reveal}>
            <div className="gb-stats-inner">
                {STAT_KEYS.map((key) => (
                    <div key={key} className="gb-stat">
                        <div className="gb-stat-val">{t(`stats.items.${key}.value`)}</div>
                        <div className="gb-stat-label">{t(`stats.items.${key}.label`)}</div>
                        <div className="gb-stat-sub">{t(`stats.items.${key}.sub`)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
