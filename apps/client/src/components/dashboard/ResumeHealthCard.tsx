import { AlertTriangle, Check, CircleDashed, Info, ShieldCheck, Loader, ExternalLink } from "lucide-react";
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

function scoreSummary(score: number): string {
    if (score >= 85) return "Excellent score ATS";
    if (score >= 70) return "Bon score ATS";
    if (score >= 55) return "Score passable";
    return "Nécessite des améliorations";
}

function scoreDetails(score: number): string {
    if (score >= 85) return "Votre CV est très bien structuré et lisible par les ATS.";
    if (score >= 70) return "Votre CV est bien lu par les ATS, quelques améliorations possibles.";
    if (score >= 55) return "Certains éléments réduisent la compatibilité ATS de votre CV.";
    return "Votre CV nécessite des améliorations pour être lu correctement par les ATS.";
}

interface CheckItem {
    label: string;
    status: string;
    ok: boolean;
}

function buildChecks(score: number): CheckItem[] {
    return [
        {
            label: "Mots-clés",
            status: score >= 75 ? "Optimisés" : score >= 55 ? "Partiels" : "Insuffisants",
            ok: score >= 75,
        },
        {
            label: "Mise en forme",
            status: score >= 70 ? "Compatible" : "À revoir",
            ok: score >= 70,
        },
        {
            label: "Complétude",
            status: score >= 80 ? "Complète" : score >= 60 ? "Partielle" : "Incomplète",
            ok: score >= 80,
        },
    ];
}


export default function ResumeHealthCard() {
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

    return (
        <Card className="h-full border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
            <CardHeader className="px-5 pt-5 md:px-6">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" style={{ color }} />
                        <CardTitle className="text-base text-[var(--gb-text)]">ATS Resume Health</CardTitle>
                    </div>
                    <span title="Score basé sur la lisibilité de votre dernier CV par les systèmes ATS.">
                        <Info className="h-4 w-4 text-[var(--gb-muted)]" />
                    </span>
                </div>
                {latestCv && (
                    <p className="text-xs text-[var(--gb-muted)] mt-1 truncate">
                        Basé sur : <span className="font-medium text-[var(--gb-text-off)]">{latestCv.title}</span>
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
                            <p className="font-semibold text-[var(--gb-muted)]">Chargement…</p>
                        </div>
                    </div>
                )}

                {!isLoading && !latestCv && (
                    <div className="text-center py-4">
                        <p className="text-sm text-[var(--gb-muted)] mb-3">
                            Créez votre premier CV pour voir votre score ATS ici.
                        </p>
                        <button
                            onClick={() => navigate("/app/cv/create")}
                            className="text-sm font-semibold"
                            style={{ color: "#16A34A", background: "none", border: "none", cursor: "pointer" }}
                        >
                            Créer un CV →
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
                                <p className="font-semibold text-[var(--gb-text)]">Score non disponible</p>
                                <p className="text-sm text-[var(--gb-muted)]">
                                    Ouvrez votre CV et analysez sa lisibilité ATS.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/app/cv/${latestCv._id}`, { state: { openAtsReport: true } })}
                            className="inline-flex items-center gap-2 text-sm font-semibold"
                            style={{ color: "#16A34A", background: "none", border: "none", cursor: "pointer" }}
                        >
                            <CircleDashed className="h-4 w-4" />
                            Analyser mon CV
                        </button>
                    </div>
                )}

                {!isLoading && latestCv && hasScore && (
                    <>
                        <div className="flex items-center gap-4">
                            <div
                                className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl font-bold text-[var(--gb-text)]"
                                style={{ border: `4px solid ${color}` }}
                            >
                                {grade}
                            </div>
                            <div>
                                <p className="font-semibold text-[var(--gb-text)]">{scoreSummary(score)}</p>
                                <p className="text-sm text-[var(--gb-muted)]">{scoreDetails(score)}</p>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-xs text-[var(--gb-muted)]">Score global</span>
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
                                <div key={check.label} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-[var(--gb-text-off)]">
                                        {check.ok ? (
                                            <Check className="h-3.5 w-3.5" style={{ color: "#16A34A" }} />
                                        ) : (
                                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                        )}
                                        {check.label}
                                    </div>
                                    <span className="text-[var(--gb-muted)]">{check.status}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate(`/app/cv/${latestCv._id}`, { state: { openAtsReport: true } })}
                            className="inline-flex items-center gap-2 text-sm font-medium"
                            style={{ color: "#16A34A", background: "none", border: "none", cursor: "pointer" }}
                        >
                            <ExternalLink className="h-4 w-4" />
                            Voir le rapport complet
                        </button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}