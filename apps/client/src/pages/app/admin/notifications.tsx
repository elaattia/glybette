import { BellOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/hooks/useLocale";

export default function AdminNotificationsManagementPage() {
    const { t } = useLocale("admin");

    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
            <CardHeader className="px-5 pt-5 md:px-6">
                <CardTitle className="flex items-center gap-2 text-base text-[var(--gb-text)]">
                    <BellOff className="h-4 w-4 text-[#16A34A]" />
                    {t("notifications.title")}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 text-sm text-[var(--gb-muted)] md:px-6 md:pb-6">
                {t("notifications.description")}
            </CardContent>
        </Card>
    );
}
