import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useLocale } from "@/hooks/useLocale";
import type { AppLocale } from "@/i18n";
import { cn } from "@/lib/utils";

const LOCALES: AppLocale[] = ["en", "fr"];

type LanguageMenuItemsProps = {
    onSelect?: () => void;
};

export function LanguageMenuItems({ onSelect }: LanguageMenuItemsProps) {
    const { locale, setLocale } = useLocale();
    const { t } = useTranslation("common");

    return LOCALES.map((value) => (
        <DropdownMenuItem
            key={value}
            className="cursor-pointer justify-between"
            onSelect={() => {
                setLocale(value);
                onSelect?.();
            }}>
            <span>{t(`language.${value}`)}</span>
            <Check className={cn("h-4 w-4", locale === value ? "opacity-100" : "opacity-0")} aria-hidden />
        </DropdownMenuItem>
    ));
}
