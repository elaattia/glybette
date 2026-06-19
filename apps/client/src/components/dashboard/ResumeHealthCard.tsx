import { AlertTriangle, Check, CircleDashed, Info, ShieldCheck, Loader, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { cvApi } from "@/features/cv-builder";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

function scoreColor(score: number) {
    if (score >= 80) return "#16A34A";
    if (score >= 60) return "#ca8a04";
    return "#dc2626";
}

function scoreGrade(score: number): string {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B+";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    return "D";
}

type ScoreTier = "excellent" | "good" | "fair" | "needsImprovement";

function getScoreTier(score: number): ScoreTier {
    if (score >= 85) return "excellent";
    if (score >= 70) return "good";
    if (score >= 55) return "fair";
    return "needsImprovement";
}

interface CheckItem {
    key: "keywords" | "formatting" | "completeness";
    statusKey: string;
    ok: boolean;
}

function buildChecks(score: number): CheckItem[] {
    return [
        {
            key: "keywords",
            statusKey: score >= 75 ? "optimized" : score >= 55 ? "partial" : "insufficient",
            ok: score >= 75,
        },
        {
            key: "formatting",
            statusKey: score >= 70 ? "compatible" : "needsReview",
            ok: score >= 70,
        },
        {
            key: "completeness",
            statusKey: score >= 80 ? "complete" : score >= 60 ? "partial" : "incomplete",
            ok: score >= 80,
        },
    ];
}

export default function ResumeHealthCard() {
    const { t } = useTranslation("dashboard");
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const { data: cvListData, isLoading } = useQuery({
        queryKey: ["cvs"],
        queryFn: () => cvApi.list().then((r) => r.cvs),
        enabled: isAuthenticated,
        staleTime: 30_000,
    });

    const latestCv = cvListData?.[0];

    const rawScore = (latestCv as any)?.atsScoreCvOnly ?? latestCv?.atsScore;
    const hasScore = rawScore != null;
    const score: number = hasScore ? (rawScore as number) : 0;

    const color = hasScore ? scoreColor(score) : "#94a3b8";
    const grade = hasScore ? scoreGrade(score) : "—";
    const checks = hasScore ? buildChecks(score) : [];
    const scoreTier = hasScore ? getScoreTier(score) : null;

    return (
        <Card className="h-full border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
            <CardHeader className="px-5 pt-5 md:px-6">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" style={{ color }} />
                        <CardTitle className="text-base text-[var(--gb-text)]">{t("resumeHealth.title")}</CardTitle>
                    </div>
                    <span title={t("resumeHealth.tooltip")}>
                        <Info className="h-4 w-4 text-[var(--gb-muted)]" />
                    </span>
                </div>
                {latestCv && (
                    <p className="text-xs text-[var(--gb-muted)] mt-1 truncate">
                        {t("resumeHealth.basedOn")}{" "}
                        <span className="font-medium text-[var(--gb-text-off)]">{latestCv.title}</span>
                    </p>
                )}
            </CardHeader>

            <CardContent className="space-y-5 px-5 pb-5 md:px-6 md:pb-6">

                {isLoading && (
                    <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-full border-4 border-[var(--gb-border)] grid place-items-center">
                            <Loader className="h-5 w-5 text-[var(--gb-muted)] animate-spin" />
                        </div>
                        <div>
                            <p className="font-semibold text-[var(--gb-muted)]">{t("resumeHealth.loading")}</p>
                        </div>
                    </div>
                )}

                {!isLoading && !latestCv && (
                    <div className="text-center py-4">
                        <p className="text-sm text-[var(--gb-muted)] mb-3">
                            {t("resumeHealth.empty")}
                        </p>
                        <button
                            onClick={() => navigate("/app/cv/create")}
                            className="text-sm font-semibold"
                            style={{ color: "#16A34A", background: "none", border: "none", cursor: "pointer" }}
                        >
                            {t("resumeHealth.createCv")}
                        </button>
                    </div>
                )}

                {!isLoading && latestCv && !hasScore && (
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl font-bold"
                                style={{ border: "4px solid var(--gb-border)", color: "var(--gb-muted)" }}
                            >
                                —
                            </div>
                            <div>
                                <p className="font-semibold text-[var(--gb-text)]">{t("resumeHealth.scoreUnavailable")}</p>
                                <p className="text-sm text-[var(--gb-muted)]">
                                    {t("resumeHealth.analyzePrompt")}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/app/cv/${latestCv._id}`, { state: { openAtsReport: true } })}
                            className="inline-flex items-center gap-2 text-sm font-semibold"
                            style={{ color: "#16A34A", background: "none", border: "none", cursor: "pointer" }}
                        >
                            <CircleDashed className="h-4 w-4" />
                            {t("resumeHealth.analyzeButton")}
                        </button>
                    </div>
                )}

                {!isLoading && latestCv && hasScore && scoreTier && (
                    <>
                        <div className="flex items-center gap-4">
                            <div
                                className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl font-bold text-[var(--gb-text)]"
                                style={{ border: `4px solid ${color}` }}
                            >
                                {grade}
                            </div>
                            <div>
                                <p className="font-semibold text-[var(--gb-text)]">
                                    {t(`resumeHealth.scoreSummary.${scoreTier}`)}
                                </p>
                                <p className="text-sm text-[var(--gb-muted)]">
                                    {t(`resumeHealth.scoreDetails.${scoreTier}`)}
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-xs text-[var(--gb-muted)]">{t("resumeHealth.overallScore")}</span>
                                <span className="text-xs font-bold" style={{ color }}>{score}/100</span>
                            </div>
                            <div
                                style={{
                                    height: "6px",
                                    background: "var(--gb-app-hover)",
                                    borderRadius: "99px",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${score}%`,
                                        background: color,
                                        borderRadius: "99px",
                                        transition: "width 0.8s ease",
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {checks.map((check) => (
                                <div key={check.key} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-[var(--gb-text-off)]">
                                        {check.ok ? (
                                            <Check className="h-3.5 w-3.5" style={{ color: "#16A34A" }} />
                                        ) : (
                                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                        )}
                                        {t(`resumeHealth.checks.${check.key}.label`)}
                                    </div>
                                    <span className="text-[var(--gb-muted)]">
                                        {t(`resumeHealth.checks.${check.key}.${check.statusKey}`)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate(`/app/cv/${latestCv._id}`, { state: { openAtsReport: true } })}
                            className="inline-flex items-center gap-2 text-sm font-medium"
                            style={{ color: "#16A34A", background: "none", border: "none", cursor: "pointer" }}
                        >
                            <ExternalLink className="h-4 w-4" />
                            {t("resumeHealth.viewFullReport")}
                        </button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
