import { useLocale } from "@/hooks/useLocale";
import { Label, Textarea } from "./primitives";
import { AiEnhanceButton } from "../ai/AiEnhanceButton";

interface SummaryProps {
    data: { text: string };
    onChange: (d: { text: string }) => void;
    onAiEnhance?: () => void;
    isEnhancing?: boolean;
}

export function SummarySection({ data, onChange, onAiEnhance, isEnhancing }: SummaryProps) {
    const { t } = useLocale("cvBuilder");
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
                <Label>{t("sections.summary.label")}</Label>
                {onAiEnhance && (
                    <AiEnhanceButton onClick={onAiEnhance} isLoading={isEnhancing} disabled={!data.text.trim()} />
                )}
            </div>
            <Textarea
                rows={4}
                placeholder={t("sections.summary.placeholder")}
                value={data.text}
                onChange={(e) => onChange({ text: e.target.value })}
            />
        </div>
    );
}
