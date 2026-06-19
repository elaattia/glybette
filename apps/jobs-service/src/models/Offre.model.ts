import mongoose, { Schema, type Document } from "mongoose";

export interface OffreDoc extends Document {
    hash_unique: string;
    titre: string;
    entreprise?: string;
    description?: string;
    competences: string[];
    localisation?: string;
    salaire?: string;
    type_contrat?: string;
    lien_original: string;
    lien_image?: string;
    type_offre: string;
    domaine?: string;
    source_site: string;
    date_publication?: Date;
    date_scraped: Date;

    company_about?: string;
    niveau_experience?: string;
    taille_entreprise?: string;
    teletravail?: string;
    nb_candidats?: string;
    site_web_entreprise?: string;
    email_contact?: string;

    status: "active" | "archivee";
    nb_vues: number;
    nb_clics: number;
    date_updated: Date;
    createdBy?: string;
}

const OffreSchema = new Schema<OffreDoc>(
    {
        hash_unique: { type: String, required: true, unique: true },
        titre: { type: String, required: true },
        entreprise: String,
        description: String,
        competences: [String],
        localisation: String,
        salaire: String,
        type_contrat: String,
        lien_original: { type: String, required: true },
        lien_image: String,
        type_offre: { type: String, default: "emploi" },
        domaine: String,
        source_site: { type: String, required: true },
        date_publication: Date,
        date_scraped: { type: Date, default: Date.now },
        company_about: String,
        niveau_experience: String,
        taille_entreprise: String,
        teletravail: String,
        nb_candidats: String,
        site_web_entreprise: String,
        email_contact: String,
        status: { type: String, enum: ["active", "archivee"], default: "active" },
        nb_vues: { type: Number, default: 0 },
        nb_clics: { type: Number, default: 0 },
        date_updated: { type: Date, default: Date.now },
        createdBy: String,
    },
    { timestamps: true },
);

OffreSchema.index({ type_offre: 1 });
OffreSchema.index({ source_site: 1 });
OffreSchema.index({ createdBy: 1 });
OffreSchema.index({ status: 1 });
OffreSchema.index({ date_scraped: -1 });
OffreSchema.index({ date_publication: -1 });
OffreSchema.index({ localisation: 1 });
OffreSchema.index({ nb_vues: -1 });
OffreSchema.index({ teletravail: 1 });
OffreSchema.index({ niveau_experience: 1 });
OffreSchema.index(
    { titre: "text", description: "text", entreprise: "text", competences: "text" },
    { name: "text_search_index" },
);

export const OffreModel = mongoose.model<OffreDoc>("Offre", OffreSchema);