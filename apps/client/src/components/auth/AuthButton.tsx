import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface AuthButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    icon: ReactNode;
    label: string;
    variant: "google" | "linkedin" | "github";
    isLoading?: boolean;
}

export function AuthButton({ onClick, disabled, icon, label, variant, isLoading }: AuthButtonProps) {
    const { t } = useTranslation("auth");

    const baseClasses =
        "group relative w-full flex items-center justify-center gap-3 rounded-xl py-4 px-6 font-medium text-[15px] transition-all duration-300 overflow-hidden disabled:cursor-not-allowed cursor-pointer";

    const variantClasses = {
        google: "bg-white text-[#1f1f1f] border border-[#dadce0] hover:bg-[#f8f9fa] hover:border-[#d2e3fc] hover:shadow-[0_1px_3px_rgba(66,133,244,0.3)] disabled:bg-[#f1f3f4] disabled:text-[#3c4043] disabled:border-[#dadce0] ",
        linkedin: "bg-[var(--gb-surface2)] text-[var(--gb-muted)] border border-[var(--gb-border)] cursor-not-allowed",
        github: "bg-[var(--gb-surface2)] text-[var(--gb-muted)] border border-[var(--gb-border)] cursor-not-allowed",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseClasses} ${variantClasses[variant]}`}>
            {!disabled && variant === "google" && (
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-[#4285f4]/5 to-[#4285f4]/10" />
                </span>
            )}

            <span
                className={`relative z-10 flex-shrink-0 transition-transform duration-300 ${
                    !disabled && variant === "google" ? "group-hover:scale-105" : ""
                }`}>
                {icon}
            </span>

            <span className="relative z-10 font-['DM_Sans'] tracking-wide">
                {isLoading ? t("login.pleaseWait") : label}
            </span>

            {disabled && variant !== "google" && (
                <span className="absolute top-1/2 -translate-y-1/2 right-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--gb-muted2)] opacity-60">
                    {t("login.soon")}
                </span>
            )}
        </button>
    );
}
