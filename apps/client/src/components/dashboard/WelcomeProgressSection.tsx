import { CircleCheckBig, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFullProfile } from "@/hooks/useUserProfile";
import type { UserProfileData } from "@/hooks/useUserProfile";

function computeCompletion(profile: UserProfileData) {
    const checks = [
        { key: "personalInfo" as const, done: Boolean(profile.firstName || profile.lastName) },
        { key: "background" as const, done: Boolean(profile.domain) },
        { key: "journey" as const, done: Boolean(profile.journey) },
        { key: "lookingFor" as const, done: Boolean((profile.opportunities as string[] | undefined)?.length) },
        { key: "academic" as const, done: Boolean(profile.university || profile.degree) },
    ];
    const score = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);
    return { score, checks };
}

export default function WelcomeProgressSection() {
    const { t } = useTranslation("dashboard");
    const { t: tCommon } = useTranslation("common");
    const navigate = useNavigate();
    const auth = useAuth();

    const { profile } = useFullProfile();

    const displayName =
        (profile.firstName && `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`) ||
        auth.user?.name?.trim() ||
        auth.user?.email?.split("@")[0] ||
        tCommon("user.fallbackName");

    const { score, checks } = computeCompletion(profile);

    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
            <CardHeader className="px-5 pt-5 md:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-[var(--gb-muted)]">
                            {t("welcomeProgress.label")}
                        </p>
                        <CardTitle className="mt-1 text-2xl font-bold text-[var(--gb-text)]">
                            {t("welcomeProgress.greeting", { name: displayName })}
                        </CardTitle>
                        <p className="mt-1 text-sm text-[var(--gb-muted)]">
                            {score === 100
                                ? t("welcomeProgress.complete")
                                : t("welcomeProgress.incomplete", { score })}
                        </p>
                    </div>
                    {score < 100 && (
                        <Button
                            type="button"
                            className="gb-btn-primary h-10 px-4 py-0 text-sm"
                            onClick={() => navigate("/onboarding")}>
                            <Plus className="h-4 w-4" />
                            {t("welcomeProgress.completeProfile")}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 md:px-6 md:pb-6">
                <Progress value={score} className="h-2 bg-[var(--gb-app-hover)]" />

                <div className="flex flex-wrap gap-2">
                    {checks.map((item) => (
                        <Badge
                            key={item.key}
                            variant="outline"
                            className="h-7 rounded-full border-[var(--gb-border)] bg-[var(--gb-bg)] px-3 text-xs text-[var(--gb-text-off)]">
                            {item.done ? (
                                <CircleCheckBig className="h-3.5 w-3.5 text-[#16A34A]" />
                            ) : (
                                <Plus className="h-3.5 w-3.5 text-[#0284C7]" />
                            )}
                            {t(`welcomeProgress.checks.${item.key}`)}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
