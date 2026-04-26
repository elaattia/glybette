import { Construction } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AppSectionPlaceholderProps = {
    sectionName: string;
};

export default function AppSectionPlaceholder({ sectionName }: AppSectionPlaceholderProps) {
    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
            <CardHeader className="px-5 pt-5 md:px-6">
                <CardTitle className="flex items-center gap-2 text-lg text-[var(--gb-text)]">
                    <Construction className="h-4 w-4 text-[#16A34A]" />
                    {sectionName}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 text-sm text-[var(--gb-muted)] md:px-6 md:pb-6">
                This section is scaffolded in the new app shell and ready for feature implementation.
            </CardContent>
        </Card>
    );
}
