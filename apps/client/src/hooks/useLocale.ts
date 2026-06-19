import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { changeAppLocale, type AppLocale } from "@/i18n";
import { useLocalPreference } from "@/hooks/useLocalPreference";

export function useLocale(ns?: string | string[]) {
    const [storedLocale, setStoredLocale] = useLocalPreference<AppLocale>("app:locale", "en");
    const { t, i18n } = useTranslation(ns);

    const locale: AppLocale = i18n.language === "fr" ? "fr" : "en";

    const setLocale = useCallback(
        (next: AppLocale) => {
            setStoredLocale(next);
            void changeAppLocale(next);
        },
        [setStoredLocale],
    );

    return { locale: locale ?? storedLocale, setLocale, t, i18n };
}
