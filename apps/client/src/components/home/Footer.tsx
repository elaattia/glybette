import "@/styles/home/footer.css";
import { useTranslation } from "react-i18next";

const COLUMN_KEYS = ["platform", "company", "legal"] as const;

const COLUMN_LINKS: Record<(typeof COLUMN_KEYS)[number], readonly string[]> = {
    platform: ["features", "howItWorks", "pricing", "blog"],
    company: ["about", "careers", "contact", "partners"],
    legal: ["privacy", "terms", "cookies"],
};

const COLUMN_HREFS: Record<(typeof COLUMN_KEYS)[number], readonly string[]> = {
    platform: ["#features", "#how-it-works", "#pricing", "/blog"],
    company: ["/about", "/careers", "/contact", "/partners"],
    legal: ["/privacy", "/terms", "/cookies"],
};

export default function Footer() {
    const { t } = useTranslation("landing");

    return (
        <footer className="gb-footer">
            <div className="gb-footer-inner">
                <div className="gb-footer-top">
                    <div>
                        <a href="/" className="gb-footer-logo">
                            {t("footer.brand")}
                        </a>
                        <p className="gb-footer-tagline">{t("footer.tagline")}</p>
                    </div>
                    {COLUMN_KEYS.map((colKey) => (
                        <div key={colKey} className="gb-footer-col">
                            <h4>{t(`footer.columns.${colKey}.title`)}</h4>
                            <ul>
                                {COLUMN_LINKS[colKey].map((linkKey, index) => (
                                    <li key={linkKey}>
                                        <a href={COLUMN_HREFS[colKey][index]}>
                                            {t(`footer.columns.${colKey}.links.${linkKey}`)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="gb-footer-bottom">
                    <p className="gb-footer-copy">{t("footer.copyright")}</p>
                    <p className="gb-footer-made">
                        {t("footer.madeIn")} <span>{t("footer.country")}</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
