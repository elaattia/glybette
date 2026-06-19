import { useState, useEffect } from "react";
import { Building2, CheckCircle2, Loader2, Users, Link } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";
import { useUser } from "@/hooks/useUser";

export default function EnterpriseDashboardPage() {
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
                    entreprise: user?.companyName ?? "Entreprise partenaire",
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
                        Créer une nouvelle offre
                    </CardTitle>
                    <CardDescription>
                        Publiez des offres qui seront mises en avant auprès des candidats Glybette.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-5 pb-5 md:px-6 md:pb-6">
                    {success && (
                        <div className="p-4 bg-[#16A34A]/10 border border-[#16A34A]/20 rounded-lg flex items-center gap-3 text-[#16A34A]">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Votre offre a été publiée avec succès ! Elle est maintenant visible par les étudiants.</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="titre">Titre du poste <span className="text-red-500">*</span></Label>
                                <Input
                                    id="titre"
                                    name="titre"
                                    required
                                    placeholder="Ex: Developpeur Fullstack React/Node"
                                    value={formData.titre}
                                    onChange={handleChange}
                                    className="bg-[var(--gb-surface)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="localisation">Localisation <span className="text-red-500">*</span></Label>
                                <Input
                                    id="localisation"
                                    name="localisation"
                                    required
                                    placeholder="Ex: Paris, France"
                                    value={formData.localisation}
                                    onChange={handleChange}
                                    className="bg-[var(--gb-surface)]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type_offre">Type de contrat</Label>
                                <select
                                    id="type_offre"
                                    name="type_offre"
                                    value={formData.type_offre}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 py-2 text-sm text-[var(--gb-text)] outline-none"
                                >
                                    <option value="emploi">CDI / CDD (Emploi)</option>
                                    <option value="stage">Stage / Alternance</option>
                                    <option value="pfe">Projet de fin d'études (PFE)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="teletravail">Télétravail</Label>
                                <select
                                    id="teletravail"
                                    name="teletravail"
                                    value={formData.teletravail}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 py-2 text-sm text-[var(--gb-text)] outline-none"
                                >
                                    <option value="hybrid">Hybride</option>
                                    <option value="remote">100% Remote</option>
                                    <option value="onsite">Sur site</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={5}
                                placeholder="Décrivez les missions, le profil recherché..."
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
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publier l'offre"}
                        </button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                <CardHeader className="px-5 pt-5 md:px-6">
                    <CardTitle className="flex items-center gap-2 text-lg text-[var(--gb-text)]">
                        <Link className="h-5 w-5 text-[#10b981]" />
                        Mes offres publiées ({offres.length})
                    </CardTitle>
                    <CardDescription>
                        Gérez vos offres d'emploi et consultez les candidatures reçues.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-6">
                    {loadingOffres ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[var(--gb-muted)]" />
                            <p className="text-[var(--gb-muted)] text-sm">Chargement des offres...</p>
                        </div>
                    ) : offres.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="w-12 h-12 text-[var(--gb-muted)] mx-auto mb-3 opacity-50" />
                            <p className="text-[var(--gb-muted)]">Aucune offre publiée pour le moment</p>
                            <p className="text-xs text-[var(--gb-muted)] mt-1">Créez votre première offre ci-dessus</p>
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
                                            Actif
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--gb-muted)] mb-3">{offre.localisation}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-[var(--gb-border)]">
                                        <div className="flex items-center gap-2 text-xs text-[var(--gb-muted)]">
                                            <Users className="w-4 h-4" />
                                            <span>{offre.nb_candidats || 0} candidats</span>
                                        </div>
                                        <a
                                            href={`/app/enterprise/applications?offreId=${offre._id}`}
                                            className="text-xs font-500 text-[#3B82F6] hover:text-[#2563EB]"
                                        >
                                            Voir plus →
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
