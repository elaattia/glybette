export type TypeOffre = "emploi" | "stage" | "pfe" | "opportunite";

export type SourceSite =
  | "indeed"
  | "welcometothejungle"
  | "linkedin"
  | "pfebooks.com";

export interface Offre {
  _id: string;
  hash_unique: string;

  titre: string;
  entreprise?: string | null;
  description?: string | null;
  competences: string[];
  localisation?: string | null;
  salaire?: string | null;
  type_contrat?: string | null;

  lien_original: string;
  lien_image?: string | null;

  type_offre: TypeOffre;
  domaine?: string | null;
  status: "active" | "archivee";
  source_site: SourceSite;

  date_publication?: string | null;
  date_scraped: string;
  date_updated: string;

  nb_vues: number;
  nb_clics: number;

  company_about?: string | null;       
  niveau_experience?: string | null;   
  taille_entreprise?: string | null;   
  teletravail?: string | null;         
  nb_candidats?: string | null;        
  site_web_entreprise?: string | null;

  categories?: string[] | null;
  nb_sujets?: number | null;
  email_contact?: string | null;
  telephone?: string | null;
}

export interface OffresResponse {
  total: number;
  page: number;
  pages: number;
  offres: Offre[];
}

export interface OffresFilters {
  type_offre?: TypeOffre;
  source?: SourceSite;
  localisation?: string;
  search?: string;
  page?: number;
  limit?: number;
  tri?: "recent" | "vues";
  date_posted?: "today" | "this_week" | "this_hour" | "3days";
  teletravail?: "remote" | "hybrid" | "onsite";
  niveau_experience?: string;
}

export interface ScrapingStats {
  total_actives: number;
  total_archives: number;
  nouvelles_24h: number;
  par_type: Record<TypeOffre, number>;
  par_source: Record<SourceSite, number>;
  derniers_scrapings: ScrapingLog[];
}

export interface ScrapingLog {
  source_site: SourceSite;
  started_at: string;
  finished_at?: string;
  status: "running" | "success" | "partial" | "failed";
  nb_scraped?: number;
  nb_nouvelles?: number;
  nb_doublons?: number;
  nb_erreurs?: number;
  message?: string;
}

export interface ScrapingSource {
  id: string;
  nom: string;
  frequence: string;
  methode: string;
}