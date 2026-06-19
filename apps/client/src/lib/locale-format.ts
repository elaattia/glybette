import type { TFunction } from "i18next";
import type { AppLocale } from "@/i18n";

export function getIntlLocale(locale: AppLocale): string {
    return locale === "fr" ? "fr-FR" : "en-US";
}

export function formatDate(value: Date | string, locale: AppLocale, options?: Intl.DateTimeFormatOptions): string {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) {
        return "";
    }
    return date.toLocaleDateString(getIntlLocale(locale), options);
}

export function formatDateTime(value: Date | string, locale: AppLocale, options?: Intl.DateTimeFormatOptions): string {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) {
        return "";
    }
    return date.toLocaleString(getIntlLocale(locale), options);
}

export function formatTime(value: Date | string, locale: AppLocale, options?: Intl.DateTimeFormatOptions): string {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) {
        return "";
    }
    return date.toLocaleTimeString(getIntlLocale(locale), options);
}

export function formatNumber(value: number, locale: AppLocale, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(getIntlLocale(locale), options).format(value);
}

export function timeAgo(dateStr: string | null | undefined, t: TFunction, locale: AppLocale): string {
    if (!dateStr) {
        return t("common:timeAgo.recently");
    }
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
        return t("common:timeAgo.recently");
    }
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) {
        return t("common:timeAgo.justNow");
    }
    if (diff < 3600) {
        return t("common:timeAgo.minutesAgo", { count: Math.floor(diff / 60) });
    }
    if (diff < 86400) {
        return t("common:timeAgo.hoursAgo", { count: Math.floor(diff / 3600) });
    }
    if (diff < 604800) {
        return t("common:timeAgo.daysAgo", { count: Math.floor(diff / 86400) });
    }
    return formatDate(date, locale, { day: "numeric", month: "short" });
}
