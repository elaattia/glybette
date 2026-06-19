import "@/styles/home/features.css";
import { useTranslation } from "react-i18next";
import { Brain, Target, Mic, BarChart3, FolderKanban } from "lucide-react";

const FEAT_KEYS = ["cvBuilder", "portfolioBuilder", "interviewPrep", "courses", "studies", "insights"] as const;

const FEAT_ICONS = [
    <Brain className="w-6 h-6" />,
    <Target className="w-6 h-6" />,
    <Mic className="w-6 h-6" />,
    <Target className="w-6 h-6" />,
    <FolderKanban className="w-6 h-6" />,
    <BarChart3 className="w-6 h-6" />,
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

export default function Features() {
    const { t } = useTranslation("landing");
    const reveal = useReveal();

    return (
        <section id="features">
            <div className="gb-features" ref={reveal}>
                <div className="gb-features-header">
                    <div className="gb-sec-label">{t("features.label")}</div>
                    <h2>
                        {t("features.titleLine1")}
                        <br />
                        {t("features.titleLine2")}
                    </h2>
                    <p>{t("features.subtitle1")}</p>
                    <p>{t("features.subtitle2")}</p>
                </div>

                <div className="gb-feat-grid">
                    {FEAT_KEYS.map((key, index) => (
                        <div key={key} className="gb-feat">
                            <div className="gb-feat-icon">{FEAT_ICONS[index]}</div>
                            <div>
                                <h3>{t(`features.items.${key}.title`)}</h3>
                                <p className="gb-feat-desc">{t(`features.items.${key}.description`)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
