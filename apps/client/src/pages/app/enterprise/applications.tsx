import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, Users, TrendingUp, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { applicationsApi } from "@/features/jobs/api/applications.api";
import type { ApplicationWithOffreDTO } from "@glybette/contracts";

export default function EnterpriseApplicationsPage() {
    const [applications, setApplications] = useState<ApplicationWithOffreDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [expandedApp, setExpandedApp] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const filterOffreId = searchParams.get("offreId");

    useEffect(() => {
        loadApplications();
    }, [filterOffreId]);

    const loadApplications = async () => {
        try {
            setLoading(true);
            const data = await applicationsApi.getEnterpriseApplications();
            setApplications(data.applications);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement des candidatures");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appId: string, newStatus: string) => {
        setUpdatingId(appId);
        try {
            await applicationsApi.updateApplicationStatus(appId, newStatus);
            const updated = applications.map((app) =>
                app._id === appId ? { ...app, status: newStatus as any } : app,
            );
            setApplications(updated);
        } catch (err) {
            alert("Erreur lors de la mise à jour");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredApps = applications
        .filter((app) => !filterOffreId || app.offre?._id === filterOffreId)
        .filter((app) => !selectedStatus || app.status === selectedStatus);

    const selectedOfferTitle = filterOffreId
        ? applications.find((app) => app.offre?._id === filterOffreId)?.offre?.titre
        : null;

    const statsSource = filterOffreId
        ? applications.filter((app) => app.offre?._id === filterOffreId)
        : applications;

    const stats = {
        total: statsSource.length,
        pending: statsSource.filter((a) => a.status === "pending").length,
        viewed: statsSource.filter((a) => a.status === "viewed").length,
        accepted: statsSource.filter((a) => a.status === "accepted").length,
        rejected: statsSource.filter((a) => a.status === "rejected").length,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return { bg: "#fef3c7", text: "#92400e", icon: Clock };
            case "viewed":
                return { bg: "#dbeafe", text: "#1e40af", icon: Users };
            case "accepted":
                return { bg: "#dcfce7", text: "#15803d", icon: CheckCircle2 };
            case "rejected":
                return { bg: "#fee2e2", text: "#991b1b", icon: XCircle };
            default:
                return { bg: "#f3f4f6", text: "#374151", icon: Clock };
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: "En attente",
            viewed: "Consulté",
            accepted: "Accepté",
            rejected: "Rejeté",
        };
        return labels[status] || status;
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                <CardHeader className="px-5 pt-5 md:px-6">
                    <CardTitle className="flex items-center gap-2 text-lg text-[var(--gb-text)]">
                        <Users className="h-5 w-5 text-[#3B82F6]" />
                        Gestion des Candidatures
                    </CardTitle>
                    <CardDescription>
                        {selectedOfferTitle
                            ? `Candidatures reçues pour l'offre : ${selectedOfferTitle}`
                            : "Consultez et gérez les candidatures reçues pour vos offres."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-5 pb-5 md:px-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <StatCard label="Total" value={stats.total} color="#6366f1" />
                        <StatCard label="En attente" value={stats.pending} color="#f59e0b" />
                        <StatCard label="Consulté" value={stats.viewed} color="#3b82f6" />
                        <StatCard label="Accepté" value={stats.accepted} color="#10b981" />
                        <StatCard label="Rejeté" value={stats.rejected} color="#ef4444" />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <FilterTab
                            label="Tous"
                            count={stats.total}
                            isActive={selectedStatus === null}
                            onClick={() => setSelectedStatus(null)}
                        />
                        <FilterTab
                            label="En attente"
                            count={stats.pending}
                            isActive={selectedStatus === "pending"}
                            onClick={() => setSelectedStatus("pending")}
                            color="bg-amber-100"
                        />
                        <FilterTab
                            label="Consulté"
                            count={stats.viewed}
                            isActive={selectedStatus === "viewed"}
                            onClick={() => setSelectedStatus("viewed")}
                            color="bg-blue-100"
                        />
                        <FilterTab
                            label="Accepté"
                            count={stats.accepted}
                            isActive={selectedStatus === "accepted"}
                            onClick={() => setSelectedStatus("accepted")}
                            color="bg-green-100"
                        />
                        <FilterTab
                            label="Rejeté"
                            count={stats.rejected}
                            isActive={selectedStatus === "rejected"}
                            onClick={() => setSelectedStatus("rejected")}
                            color="bg-red-100"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin">⟳</div>
                            <p className="text-[var(--gb-muted)] mt-2">Chargement des candidatures...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
                            {error}
                        </div>
                    ) : filteredApps.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-[var(--gb-muted)] mx-auto mb-3 opacity-50" />
                            <p className="text-[var(--gb-muted)]">
                                {selectedStatus ? "Aucune candidature avec ce statut" : "Aucune candidature reçue"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredApps.map((app) => (
                                <ApplicationCard
                                    key={app._id}
                                    app={app}
                                    isExpanded={expandedApp === app._id}
                                    isUpdating={updatingId === app._id}
                                    onToggle={() =>
                                        setExpandedApp(expandedApp === app._id ? null : app._id)
                                    }
                                    onStatusChange={(newStatus) =>
                                        handleStatusChange(app._id, newStatus)
                                    }
                                    getStatusColor={getStatusColor}
                                    getStatusLabel={getStatusLabel}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="bg-[var(--gb-surface)] p-4 rounded-lg text-center">
            <div className="text-2xl font-bold" style={{ color }}>
                {value}
            </div>
            <div className="text-xs text-[var(--gb-muted)] mt-1">{label}</div>
        </div>
    );
}

function FilterTab({
    label,
    count,
    isActive,
    onClick,
    color,
}: {
    label: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
    color?: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-500 transition-all ${
                isActive
                    ? "bg-[#3B82F6] text-white"
                    : `bg-[var(--gb-surface)] text-[var(--gb-text)] hover:${color || "bg-gray-200"}`
            }`}
        >
            {label} ({count})
        </button>
    );
}

function ApplicationCard({
    app,
    isExpanded,
    isUpdating,
    onToggle,
    onStatusChange,
    getStatusColor,
    getStatusLabel,
}: {
    app: ApplicationWithOffreDTO;
    isExpanded: boolean;
    isUpdating: boolean;
    onToggle: () => void;
    onStatusChange: (status: string) => void;
    getStatusColor: (status: string) => any;
    getStatusLabel: (status: string) => string;
}) {
    const statusInfo = getStatusColor(app.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="border border-[var(--gb-border)] rounded-lg overflow-hidden bg-[var(--gb-surface)]">
            <button
                onClick={onToggle}
                className="w-full px-5 py-4 flex items-start justify-between hover:bg-opacity-50 transition-colors"
            >
                <div className="flex-1 text-left">
                    <h3 className="font-600 text-[var(--gb-text)] mb-2">{app.offre?.titre}</h3>
                    <div className="flex items-center gap-3 text-sm text-[var(--gb-muted)]">
                        <span>{app.offre?.entreprise}</span>
                        <span>•</span>
                        <span>{new Date(app.appliedAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                </div>
                <div
                    className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-600 ml-4"
                    style={{ background: statusInfo.bg, color: statusInfo.text }}
                >
                    <StatusIcon className="w-4 h-4" />
                    {getStatusLabel(app.status)}
                </div>
            </button>

            {isExpanded && (
                <div className="px-5 py-4 bg-[var(--gb-app-panel-bg)] border-t border-[var(--gb-border)] space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <h4 className="text-sm font-600 text-[var(--gb-text)] mb-2">Candidat</h4>
                            <p className="text-sm text-[var(--gb-muted)] bg-[var(--gb-surface)] p-3 rounded">
                                {app.userId}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-600 text-[var(--gb-text)] mb-2">Documents PDF</h4>
                            <div className="flex flex-col gap-2">
                                {app.resumeUrl ? (
                                    <a
                                        href={app.resumeUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Voir le CV
                                    </a>
                                ) : (
                                    <span className="text-sm text-[var(--gb-muted)]">CV non fourni</span>
                                )}
                                {app.coverLetterUrl ? (
                                    <a
                                        href={app.coverLetterUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Voir la lettre de motivation
                                    </a>
                                ) : (
                                    <span className="text-sm text-[var(--gb-muted)]">Lettre non fournie</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-600 text-[var(--gb-text)] mb-2">Lettre de motivation</h4>
                        <p className="text-sm text-[var(--gb-muted)] bg-[var(--gb-surface)] p-3 rounded whitespace-pre-wrap">
                            {app.coverLetter || "(Pas de lettre fournie)"}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-600 text-[var(--gb-text)] mb-2">Notes du recruteur</h4>
                        <textarea
                            placeholder="Ajoutez vos notes sur cette candidature..."
                            defaultValue={app.recruiterNotes || ""}
                            onBlur={(e) => {
                                if (e.target.value !== app.recruiterNotes) {
                                }
                            }}
                            className="w-full px-3 py-2 text-sm border border-[var(--gb-border)] rounded-lg bg-[var(--gb-surface)] text-[var(--gb-text)] placeholder-[var(--gb-muted)]"
                            rows={3}
                        />
                    </div>

                    <div>
                        <h4 className="text-sm font-600 text-[var(--gb-text)] mb-2">Notation (0-5)</h4>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => {
                                    }}
                                    className={`text-2xl ${
                                        (app.rating || 0) >= star ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-600 text-[var(--gb-text)] mb-2">Changez le statut</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                { status: "pending", label: "En attente", color: "bg-amber-100 text-amber-800" },
                                { status: "viewed", label: "Consulté", color: "bg-blue-100 text-blue-800" },
                                { status: "accepted", label: "Accepter", color: "bg-green-100 text-green-800" },
                                { status: "rejected", label: "Rejeter", color: "bg-red-100 text-red-800" },
                            ].map(({ status, label, color }) => (
                                <button
                                    key={status}
                                    onClick={() => onStatusChange(status)}
                                    disabled={isUpdating || app.status === status}
                                    className={`px-3 py-2 text-sm font-600 rounded-lg transition-opacity disabled:opacity-50 ${color}`}
                                >
                                    {isUpdating && app.status !== status ? "..." : label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
