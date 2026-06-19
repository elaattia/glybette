import { Search } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { listStyles as s } from "../styles";

interface EmptyStateProps {
    onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
    const { t } = useLocale("opportunities");

    return (
        <div style={s.empty}>
            <div style={{ fontSize: 44, opacity: 0.3 }}>
                <Search size={44} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--gb-text-off)", margin: 0 }}>
                {t("list.empty.title")}
            </h3>
            <p style={{ fontSize: 14, color: "var(--gb-muted)", margin: 0 }}>
                {t("list.empty.description")}
            </p>
            <button onClick={onReset} style={s.emptyBtn}>
                {t("list.empty.resetFilters")}
            </button>
        </div>
    );
}
