import { Sparkles, Loader } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

interface AiEnhanceButtonProps {
    onClick: () => void;
    isLoading?: boolean;
    label?: string;
    disabled?: boolean;
}

export function AiEnhanceButton({ onClick, isLoading, label, disabled }: AiEnhanceButtonProps) {
    const { t } = useLocale("cvBuilder");
    const displayLabel = label ?? t("ai.enhance.defaultLabel");
    const busy = isLoading || disabled;
    return (
        <button
            onClick={onClick}
            disabled={busy}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: busy ? "rgba(22,163,74,0.07)" : "rgba(22,163,74,0.12)",
                border: "1px solid rgba(22,163,74,0.3)",
                color: "#16A34A",
                borderRadius: "7px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: busy ? "wait" : "pointer",
                transition: "background 0.15s",
                flexShrink: 0,
            }}
            onMouseEnter={(e) => {
                if (!busy) e.currentTarget.style.background = "rgba(22,163,74,0.2)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = busy ? "rgba(22,163,74,0.07)" : "rgba(22,163,74,0.12)";
            }}>
            {isLoading ? (
                <Loader style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} />
            ) : (
                <Sparkles style={{ width: 11, height: 11 }} />
            )}
            {isLoading ? t("ai.enhance.loading") : displayLabel}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
    );
}
