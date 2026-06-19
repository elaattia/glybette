import { Clock4 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const ACTIVITY_KEYS = ["cvTailored", "projectMessage", "portfolioUpdated", "opportunityStatus"] as const;

export default function RecentActivityCard() {
    const { t } = useTranslation("dashboard");

    return (
        <Card className="h-full border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
            <CardHeader className="px-5 pt-5 md:px-6">
                <CardTitle className="text-base text-[var(--gb-text)]">{t("recentActivity.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5 md:px-6 md:pb-6">
                {ACTIVITY_KEYS.map((key, index) => (
                    <div key={key}>
                        <div className="flex items-start gap-3 py-1">
                            <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--gb-app-hover)] text-[var(--gb-muted)]">
                                <Clock4 className="h-3.5 w-3.5" />
                            </span>
                            <div>
                                <p className="text-sm text-[var(--gb-text-off)]">
                                    {t(`recentActivity.items.${key}.title`)}
                                </p>
                                <p className="mt-1 text-xs text-[var(--gb-muted)]">
                                    {t(`recentActivity.items.${key}.meta`)}
                                </p>
                            </div>
                        </div>
                        {index < ACTIVITY_KEYS.length - 1 ? <Separator className="bg-[var(--gb-border)]" /> : null}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
