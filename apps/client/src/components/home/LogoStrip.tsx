import "@/styles/home/logo-strip.css";
import { useLocale } from "@/hooks/useLocale";

const companies = ["Vermeg", "Telnet", "Sofrecom", "EPS", "ISSATSOUSSE"];

export default function LogoStrip() {
    const { t } = useLocale("landing");

    return (
        <div className="gb-strip">
            <p className="gb-strip-label">{t("logoStrip.label")}</p>
            <div className="gb-strip-row">
                {companies.map((c) => (
                    <span key={c} className="gb-chip">
                        {c}
                    </span>
                ))}
            </div>
        </div>
    );
}
