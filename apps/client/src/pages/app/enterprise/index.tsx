import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EnterpriseDashboardPage() {
    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
            <CardHeader className="px-5 pt-5 md:px-6">
                <CardTitle className="flex items-center gap-2 text-lg text-[var(--gb-text)]">
                    <Building2 className="h-4 w-4 text-[#16A34A]" />
                    Enterprise dashboard
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-5 pb-5 text-sm text-[var(--gb-muted)] md:px-6 md:pb-6">
                <p>Your enterprise workspace is not available yet.</p>
                <p>Come back later - dedicated enterprise features are planned for a future microservice.</p>
            </CardContent>
        </Card>
    );
}
