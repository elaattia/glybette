export interface UserProfileSignals {
  skills: string[];
  domain: string;
  journey: string;
  opportunities: string[];
}

export interface OffreSignals {
  titre: string;
  competences: string[];
  niveau_experience: string;
  type_offre: string;
  description?: string;
  domaine?: string;
}


const DOMAIN_SYNONYMS: Record<string, string[]> = {
  informatique: [
    "développeur", "developer", "dev", "logiciel", "software", "code", "coding",
    "web", "application", "app", "backend", "frontend", "fullstack", "it", "tech",
    "système", "system", "data", "python", "java", "javascript", "react", "angular",
    "node", "sql", "database", "cloud", "devops", "réseau", "network", "sécurité", "security",
  ],
  développement: [
    "développeur", "developer", "dev", "logiciel", "software", "code", "web",
    "backend", "frontend", "fullstack", "api", "mobile", "flutter", "react", "angular", "node",
  ],
  finance: [
    "finance", "comptabilité", "comptable", "audit", "auditeur", "trésorerie",
    "banque", "banker", "analyst", "analyste", "contrôle de gestion", "controller",
    "risk", "risque", "investment", "investissement",
  ],
  marketing: [
    "marketing", "communication", "brand", "marque", "digital", "seo", "sem",
    "réseaux sociaux", "social media", "content", "contenu", "publicité", "advertising",
    "growth", "crm",
  ],
  rh: [
    "ressources humaines", "rh", "recrutement", "recruteur", "talent", "paie",
    "formation", "hr", "human resources", "people",
  ],
  gestion: [
    "gestion", "management", "manager", "chef de projet", "project manager",
    "coordinateur", "organisation", "planification", "direction",
  ],
  génie: [
    "ingénieur", "engineer", "génie", "mécanique", "électrique", "électronique",
    "industriel", "civil", "bâtiment", "construction", "travaux",
  ],
  santé: [
    "santé", "médical", "médecin", "infirmier", "pharmacie", "hôpital", "clinique",
    "biologie", "laboratoire",
  ],
  droit: ["droit", "juridique", "juriste", "avocat", "compliance", "réglementation", "légal", "legal"],
  commerce: [
    "commercial", "vente", "sales", "business development", "account manager",
    "représentant", "client",
  ],
  design: [
    "design", "ux", "ui", "graphique", "créatif", "photoshop", "figma",
    "illustrator", "maquette", "prototype",
  ],
  data: [
    "data", "données", "analyse", "analytics", "bi", "machine learning", "ia",
    "intelligence artificielle", "statistique", "datascience", "tableau", "power bi",
    "sql", "python",
  ],
};


function expandDomainKeywords(domain: string): string[] {
  const domainLower = domain.toLowerCase();
  const extra: string[] = [];
  for (const [key, synonyms] of Object.entries(DOMAIN_SYNONYMS)) {
    if (domainLower.includes(key)) {
      extra.push(...synonyms, key);
    }
  }
  const rawTokens = domainLower.split(/[\s,/\-]+/).filter((w) => w.length > 2);
  return [...new Set([...rawTokens, ...extra])];
}


export function computeRecommendationScore(
  offre: OffreSignals,
  profile: UserProfileSignals,
): number {
  const { skills = [], domain = "", journey = "", opportunities = [] } = profile;

  if (!skills.length && !domain && !journey) return 0;

  let score = 0;
  const offreText = [
    offre.titre ?? "",
    ...(offre.competences ?? []),
    offre.description ?? "",
    offre.domaine ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (skills.length > 0) {
    let matches = 0;
    for (const skill of skills) {
      if (offreText.includes(skill.toLowerCase().trim())) matches++;
    }
    score += Math.round((matches / skills.length) * 50);
  }

  if (domain) {
    const keywords = expandDomainKeywords(domain);
    if (keywords.length > 0) {
      const matchedKws = keywords.filter((kw) => offreText.includes(kw));
      if (matchedKws.length > 0) {
        const ratio = matchedKws.length / keywords.length;
        score += Math.max(12, Math.min(25, Math.round(ratio * 25 * 3)));
      }
    }
  }

  const expField = (offre.niveau_experience ?? "").toLowerCase();
  const journeyLower = journey.toLowerCase();

  if (journey) {
    const isStudent =
      journeyLower.includes("student") || journeyLower.includes("étudiant");
    const isGraduate =
      journeyLower.includes("graduate") || journeyLower.includes("jeune diplômé");
    const isJobSeeker =
      journeyLower.includes("job seeker") || journeyLower.includes("en recherche");
    const offreTypeMatch = (offre.type_offre ?? "").toLowerCase();

    if (isStudent && (expField.match(/stage|intern|pfe|junior/) || offreTypeMatch.match(/stage|pfe/))) {
      score += 15;
    } else if (isStudent && !expField) {
      score += 12;
    } else if (isGraduate && (expField.match(/junior|débutant|entry|pfe|stage/) || offreTypeMatch.match(/emploi|stage/))) {
      score += 12;
    } else if (isGraduate && !expField) {
      score += 10;
    } else if (isJobSeeker && expField.match(/junior|mid|confirmé|senior/)) {
      score += 12;
    } else if (isJobSeeker && !expField) {
      score += 8;
    } else if (!expField) {
      score += 6;
    }
  }

  if (opportunities.length > 0) {
    const oppMatches = opportunities.filter((opp) =>
      offreText.includes(opp.toLowerCase().trim()),
    );
    if (oppMatches.length > 0) score += 10;
  }

  return Math.min(score, 100);
}


export const RECOMMENDATION_THRESHOLD = 15;


export function isRecommendedForUser(
  offre: OffreSignals,
  profile: UserProfileSignals,
): boolean {
  return computeRecommendationScore(offre, profile) >= RECOMMENDATION_THRESHOLD;
}