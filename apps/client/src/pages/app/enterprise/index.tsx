import { useState, useEffect } from "react";
import { Building2, CheckCircle2, Loader2, Users, Link } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { useLocale } from "@/hooks/useLocale";

export default function EnterpriseDashboardPage() {
    const { t } = useLocale("enterprise");
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [offres, setOffres] = useState<any[]>([]);
    const [loadingOffres, setLoadingOffres] = useState(false);
    const [formData, setFormData] = useState({
        titre: "",
        localisation: "",
        type_offre: "emploi",
        teletravail: "hybrid",
        description: "",
    });

    const loadMyOffres = async () => {
        setLoadingOffres(true);
        try {
            const res = await apiRequest("/api/jobs/enterprise/offres/my-offres") as any;
            setOffres(res.offres || []);
        } catch (err) {
            console.error("Failed to load offres", err);
        } finally {
            setLoadingOffres(false);
        }
    };

    useEffect(() => {
        loadMyOffres();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            await apiRequest("/api/jobs/enterprise/offres", {
                method: "POST",
                body: JSON.stringify({
                    titre: formData.titre,
                    localisation: formData.localisation,
                    type_offre: formData.type_offre,
                    teletravail: formData.teletravail,
                    description: formData.description,
                    entreprise: user?.companyName ?? t("dashboard.defaultCompanyName"),
                }),
            });
            setSuccess(true);
            setFormData({ titre: "", localisation: "", type_offre: "emploi", teletravail: "hybrid", description: "" });
            loadMyOffres();
        } catch (error) {
            console.error("Failed to post job", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                <CardHeader className="px-5 pt-5 md:px-6">
                    <CardTitle className="flex items-center gap-2 text-lg text-[var(--gb-text)]">
                        <Building2 className="h-5 w-5 text-[#3B82F6]" />
                        {t("dashboard.createOffer.title")}
                    </CardTitle>
                    <CardDescription>{t("dashboard.createOffer.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-5 pb-5 md:px-6 md:pb-6">
                    {success && (
                        <div className="p-4 bg-[#16A34A]/10 border border-[#16A34A]/20 rounded-lg flex items-center gap-3 text-[#16A34A]">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>{t("dashboard.createOffer.successMessage")}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="titre">
                                    {t("dashboard.createOffer.jobTitle")}{" "}
                                    <span className="text-red-500">{t("dashboard.createOffer.required")}</span>
                                </Label>
                                <Input
                                    id="titre"
                                    name="titre"
                                    required
                                    placeholder={t("dashboard.createOffer.jobTitlePlaceholder")}
                                    value={formData.titre}
                                    onChange={handleChange}
                                    className="bg-[var(--gb-surface)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="localisation">
                                    {t("dashboard.createOffer.location")}{" "}
                                    <span className="text-red-500">{t("dashboard.createOffer.required")}</span>
                                </Label>
                                <Input
                                    id="localisation"
                                    name="localisation"
                                    required
                                    placeholder={t("dashboard.createOffer.locationPlaceholder")}
                                    value={formData.localisation}
                                    onChange={handleChange}
                                    className="bg-[var(--gb-surface)]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type_offre">{t("dashboard.createOffer.contractType")}</Label>
                                <select
                                    id="type_offre"
                                    name="type_offre"
                                    value={formData.type_offre}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 py-2 text-sm text-[var(--gb-text)] outline-none"
                                >
                                    <option value="emploi">{t("dashboard.contractTypes.emploi")}</option>
                                    <option value="stage">{t("dashboard.contractTypes.stage")}</option>
                                    <option value="pfe">{t("dashboard.contractTypes.pfe")}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="teletravail">{t("dashboard.createOffer.remoteWork")}</Label>
                                <select
                                    id="teletravail"
                                    name="teletravail"
                                    value={formData.teletravail}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 py-2 text-sm text-[var(--gb-text)] outline-none"
                                >
                                    <option value="hybrid">{t("dashboard.remoteOptions.hybrid")}</option>
                                    <option value="remote">{t("dashboard.remoteOptions.remote")}</option>
                                    <option value="onsite">{t("dashboard.remoteOptions.onsite")}</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                {t("dashboard.createOffer.descriptionLabel")}{" "}
                                <span className="text-red-500">{t("dashboard.createOffer.required")}</span>
                            </Label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={5}
                                placeholder={t("dashboard.createOffer.descriptionPlaceholder")}
                                value={formData.description}
                                onChange={handleChange}
                                className="flex w-full rounded-md border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 py-2 text-sm text-[var(--gb-text)] outline-none resize-y"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-10 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-md font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                t("dashboard.createOffer.publishOffer")
                            )}
                        </button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                <CardHeader className="px-5 pt-5 md:px-6">
                    <CardTitle className="flex items-center gap-2 text-lg text-[var(--gb-text)]">
                        <Link className="h-5 w-5 text-[#10b981]" />
                        {t("dashboard.myOffers.title", { count: offres.length })}
                    </CardTitle>
                    <CardDescription>{t("dashboard.myOffers.description")}</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-6">
                    {loadingOffres ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[var(--gb-muted)]" />
                            <p className="text-[var(--gb-muted)] text-sm">{t("dashboard.myOffers.loading")}</p>
                        </div>
                    ) : offres.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="w-12 h-12 text-[var(--gb-muted)] mx-auto mb-3 opacity-50" />
                            <p className="text-[var(--gb-muted)]">{t("dashboard.myOffers.emptyTitle")}</p>
                            <p className="text-xs text-[var(--gb-muted)] mt-1">{t("dashboard.myOffers.emptyHint")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {offres.map((offre) => (
                                <div
                                    key={offre._id}
                                    className="p-4 border border-[var(--gb-border)] rounded-lg bg-[var(--gb-surface)] hover:bg-opacity-80 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-600 text-[var(--gb-text)] text-sm">{offre.titre}</h3>
                                        <span className="px-2 py-1 bg-[#10b981]/10 text-[#10b981] text-xs font-500 rounded">
                                            {t("dashboard.myOffers.active")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--gb-muted)] mb-3">{offre.localisation}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-[var(--gb-border)]">
                                        <div className="flex items-center gap-2 text-xs text-[var(--gb-muted)]">
                                            <Users className="w-4 h-4" />
                                            <span>
                                                {t("dashboard.myOffers.candidates", {
                                                    count: offre.nb_candidats || 0,
                                                })}
                                            </span>
                                        </div>
                                        <a
                                            href={`/app/enterprise/applications?offreId=${offre._id}`}
                                            className="text-xs font-500 text-[#3B82F6] hover:text-[#2563EB]"
                                        >
                                            {t("dashboard.myOffers.viewMore")}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
