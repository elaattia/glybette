import React from "react";
import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import { StepFooter } from "@/components/onboarding/StepFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepEnterpriseInfoProps {
    onNext: (companyName: string) => void;
}

export function StepEnterpriseInfo({ onNext }: StepEnterpriseInfoProps) {
    const { t } = useTranslation("onboarding");
    const [companyName, setCompanyName] = React.useState("");

    return (
        <div className="flex flex-col h-full animate-slide-up-fade">
            <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
                <div className="max-w-xl mx-auto space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-[var(--gb-text)]">
                            {t("enterpriseInfo.title")}
                        </h2>
                        <p className="mt-2 text-[var(--gb-muted)]">{t("enterpriseInfo.subtitle")}</p>
                    </div>

                    <div className="space-y-4 mt-8">
                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-[var(--gb-secondary-text)]">
                                {t("enterpriseInfo.companyNameLabel")}{" "}
                                <span className="text-red-500">{t("enterpriseInfo.required")}</span>
                            </Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gb-muted)]" />
                                <Input
                                    id="companyName"
                                    placeholder={t("enterpriseInfo.companyNamePlaceholder")}
                                    value={companyName}
                                    onChange={(e: { target: { value: React.SetStateAction<string> } }) => setCompanyName(e.target.value)}
                                    className="pl-9 h-11 bg-[var(--gb-app-panel-bg)] border-[var(--gb-border)]"
                                    autoFocus
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <StepFooter
                onContinue={() => onNext(companyName.trim())}
                canContinue={!!companyName.trim()}
            />
        </div>
    );
}
