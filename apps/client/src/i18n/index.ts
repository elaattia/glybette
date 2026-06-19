import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enAdmin from "./locales/en/admin.json";
import enAuth from "./locales/en/auth.json";
import enCommon from "./locales/en/common.json";
import enCvBuilder from "./locales/en/cvBuilder.json";
import enDashboard from "./locales/en/dashboard.json";
import enEnterprise from "./locales/en/enterprise.json";
import enInsights from "./locales/en/insights.json";
import enLanding from "./locales/en/landing.json";
import enNotifications from "./locales/en/notifications.json";
import enOnboarding from "./locales/en/onboarding.json";
import enOpportunities from "./locales/en/opportunities.json";
import enPortfolio from "./locales/en/portfolio.json";
import enProjects from "./locales/en/projects.json";
import enShell from "./locales/en/shell.json";

import frAdmin from "./locales/fr/admin.json";
import frAuth from "./locales/fr/auth.json";
import frCommon from "./locales/fr/common.json";
import frCvBuilder from "./locales/fr/cvBuilder.json";
import frDashboard from "./locales/fr/dashboard.json";
import frEnterprise from "./locales/fr/enterprise.json";
import frInsights from "./locales/fr/insights.json";
import frLanding from "./locales/fr/landing.json";
import frNotifications from "./locales/fr/notifications.json";
import frOnboarding from "./locales/fr/onboarding.json";
import frOpportunities from "./locales/fr/opportunities.json";
import frPortfolio from "./locales/fr/portfolio.json";
import frProjects from "./locales/fr/projects.json";
import frShell from "./locales/fr/shell.json";

export const APP_LOCALES = ["en", "fr"] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

export const LOCALE_STORAGE_KEY = "gb-pref:app:locale";

export const I18N_NAMESPACES = [
    "common",
    "auth",
    "shell",
    "dashboard",
    "opportunities",
    "cvBuilder",
    "portfolio",
    "projects",
    "admin",
    "enterprise",
    "landing",
    "onboarding",
    "notifications",
    "insights",
] as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

function readStoredLocale(): AppLocale {
    if (typeof window === "undefined") {
        return "en";
    }
    try {
        const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
        if (raw == null || raw === "") {
            return "en";
        }
        if (raw === "en" || raw === "fr") {
            return raw;
        }
        const parsed = JSON.parse(raw) as unknown;
        if (parsed === "en" || parsed === "fr") {
            return parsed;
        }
    } catch {
        /* ignore */
    }
    return "en";
}

function persistLocale(locale: AppLocale): void {
    if (typeof window === "undefined") {
        return;
    }
    try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(locale));
    } catch {
        /* quota / private mode */
    }
}

const resources = {
    en: {
        common: enCommon,
        auth: enAuth,
        shell: enShell,
        dashboard: enDashboard,
        opportunities: enOpportunities,
        cvBuilder: enCvBuilder,
        portfolio: enPortfolio,
        projects: enProjects,
        admin: enAdmin,
        enterprise: enEnterprise,
        landing: enLanding,
        onboarding: enOnboarding,
        notifications: enNotifications,
        insights: enInsights,
    },
    fr: {
        common: frCommon,
        auth: frAuth,
        shell: frShell,
        dashboard: frDashboard,
        opportunities: frOpportunities,
        cvBuilder: frCvBuilder,
        portfolio: frPortfolio,
        projects: frProjects,
        admin: frAdmin,
        enterprise: frEnterprise,
        landing: frLanding,
        onboarding: frOnboarding,
        notifications: frNotifications,
        insights: frInsights,
    },
} as const;

void i18n.use(initReactI18next).init({
    resources,
    lng: readStoredLocale(),
    fallbackLng: "en",
    supportedLngs: [...APP_LOCALES],
    defaultNS: "common",
    ns: [...I18N_NAMESPACES],
    interpolation: { escapeValue: false },
});

if (typeof document !== "undefined") {
    document.documentElement.lang = i18n.language;
}

i18n.on("languageChanged", (lng) => {
    if (typeof document !== "undefined") {
        document.documentElement.lang = lng;
    }
    if (lng === "en" || lng === "fr") {
        persistLocale(lng);
    }
});

export function changeAppLocale(locale: AppLocale): Promise<typeof i18n.t> {
    return i18n.changeLanguage(locale);
}

export default i18n;
