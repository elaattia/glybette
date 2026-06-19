import type { AiProvider } from "../lib/ai-provider.types.js";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export class JobsAiService {
    constructor(private readonly provider: AiProvider) {}

    async computeMatching(profileText: string, offreText: string) {
        const prompt = `Tu es un expert RH et recrutement. Analyse la compatibilité entre ce profil et cette offre.

=== PROFIL CANDIDAT ===
${profileText.slice(0, 3000)}

=== OFFRE D'EMPLOI ===
${offreText.slice(0, 2000)}

Retourne UNIQUEMENT ce JSON, sans explication ni markdown :
{
  "score": 85,
  "pointsForts": ["point 1", "point 2", "point 3"],
  "pointsFaibles": ["manque 1", "manque 2"],
  "recommandations": ["conseil 1", "conseil 2"],
  "skillsManquantes": ["skill1", "skill2"],
  "skillsCorrespondantes": ["skill3", "skill4"],
  "explication": "Explication concise en 2-3 phrases du score."
}`;
        return this.provider.generateJson<any>(prompt, { maxTokens: 800 });
    }

    async generateInterviewQuestions(offreText: string, userProfile: any) {
        const profileSummary = JSON.stringify(userProfile).slice(0, 1000);
        const prompt = `Tu es un coach carrière expert. Génère des questions d'interview personnalisées.

=== OFFRE ===
${offreText.slice(0, 2000)}

=== PROFIL CANDIDAT ===
${profileSummary}

Retourne UNIQUEMENT ce JSON :
{
  "behavioural": ["Question comportementale 1", "Question comportementale 2", "Question comportementale 3"],
  "technical": ["Question technique 1", "Question technique 2", "Question technique 3"],
  "situational": ["Question situationnelle 1", "Question situationnelle 2"],
  "tips": ["Conseil de préparation 1", "Conseil 2", "Conseil 3"]
}`;
        return this.provider.generateJson<any>(prompt, { maxTokens: 1000 });
    }

    async evaluateInterviewAnswer(question: string, answer: string, jobContext: string) {
        const lang = /[àâéèêëîïôùûüç]/i.test(answer) ? "fr" : "en";
        const prompt = `Tu es un expert en coaching d'entretien. Évalue cette réponse d'entretien.

Question: ${question}
Réponse: ${answer}
Contexte poste: ${jobContext.slice(0, 500)}

Retourne UNIQUEMENT ce JSON en ${lang === "fr" ? "français" : "English"} :
{
  "score": 7,
  "strengths": ["Point fort 1", "Point fort 2"],
  "improvements": ["Amélioration 1", "Amélioration 2"],
  "suggestedAnswer": "Version améliorée de la réponse...",
  "keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3"]
}`;
        return this.provider.generateJson<any>(prompt, { maxTokens: 800 });
    }

    async getInterviewPreparationPlan(offreText: string, userProfile: any) {
        const prompt = `Tu es un coach carrière. Crée un plan de préparation d'entretien structuré.

=== OFFRE ===
${offreText.slice(0, 1500)}

Retourne UNIQUEMENT ce JSON :
{
  "duration": "3-5 jours",
  "phases": [
    {
      "title": "Recherche entreprise",
      "duration": "Jour 1",
      "tasks": ["Tâche 1", "Tâche 2"],
      "resources": ["Ressource 1"]
    }
  ],
  "keyTopics": ["Sujet 1", "Sujet 2"],
  "doList": ["À faire 1", "À faire 2"],
  "dontList": ["À éviter 1", "À éviter 2"]
}`;
        return this.provider.generateJson<any>(prompt, { maxTokens: 1000 });
    }

    async chatAboutJob(offreText: string, messages: ChatMessage[], userProfile?: any) {
        const systemPrompt = `Tu es un assistant carrière expert qui aide un candidat à préparer sa candidature pour une offre d'emploi.

=== OFFRE D'EMPLOI (contexte) ===
${offreText.slice(0, 2000)}

${userProfile ? `=== PROFIL DU CANDIDAT ===
${JSON.stringify(userProfile).slice(0, 800)}` : ""}

Tu peux répondre à toutes les questions du candidat sur :
- L'offre d'emploi (compétences requises, culture d'entreprise, type de poste...)
- La préparation à l'entretien (conseils, questions probables, réponses)
- La rédaction de CV et lettre de motivation
- Les stratégies de candidature
- Le marché du travail dans ce domaine

Réponds toujours en français, de façon concise et pratique. Sois encourageant et bienveillant.
Si tu ne sais pas quelque chose sur l'entreprise spécifique, dis-le honnêtement.`;

        const content = await this.provider.chat(
            [
                { role: "system", content: systemPrompt },
                ...messages.map((m) => ({
                    role: m.role as "user" | "assistant",
                    content: m.content,
                })),
            ],
            { maxTokens: 800, temperature: 0.7 },
        );

        return { content, role: "assistant" as const };
    }

    async generateTailoredCvSections(cvText: string, offreText: string) {
        const prompt = `Tu es un expert CV. Génère des sections de CV personnalisées et optimisées pour cette offre d'emploi spécifique.

=== CV ACTUEL ===
${cvText.slice(0, 3000)}

=== OFFRE D'EMPLOI ===
${offreText.slice(0, 1500)}

Retourne UNIQUEMENT ce JSON (sections complètes prêtes à être utilisées dans un CV) :
{
  "title": "Titre du CV adapté (ex: Développeur Full-Stack React/Node.js)",
  "personalInfo": {
    "roleTitle": "Titre de poste aligné avec l'offre"
  },
  "summary": "Résumé professionnel de 3-4 phrases, axé sur les points forts correspondant à l'offre. Utilise des mots-clés de l'offre.",
  "experience": [
    {
      "position": "Titre du poste (reformulé pour matcher l'offre si applicable)",
      "company": "Entreprise (garde l'original)",
      "description": "Description améliorée qui met en avant les compétences demandées dans l'offre. Maximum 3-4 lignes.",
      "startDate": "Date début (garde l'original)",
      "endDate": "Date fin (garde l'original)",
      "current": false,
      "location": "Lieu (garde l'original)"
    }
  ],
  "skills": [
    {
      "category": "Compétences techniques",
      "skills": ["skill1", "skill2", "skill3"]
    },
    {
      "category": "Compétences correspondantes à l'offre",
      "skills": ["skill de l'offre 1", "skill de l'offre 2"]
    }
  ],
  "keywordsAdded": ["mot-clé ajouté 1", "mot-clé ajouté 2"],
  "suggestions": ["Suggestion d'amélioration 1", "Suggestion 2"]
}

IMPORTANT: 
- Garde les vraies informations du CV (entreprises, dates, diplômes)
- Reformule les descriptions pour matcher les mots-clés de l'offre
- N'invente pas de fausses expériences
- Priorise les compétences mentionnées dans l'offre`;

        return this.provider.generateJson<any>(prompt, { maxTokens: 2000 });
    }

    async generateJobCoverLetter(params: {
        cvText: string;
        offreText: string;
        tone: string;
        userAchievements?: string[];
    }) {
        const { cvText, offreText, tone, userAchievements = [] } = params;
        const toneGuide: Record<string, string> = {
            professional: "formelle, confiante et professionnelle",
            enthusiastic: "enthousiaste, passionnée et dynamique",
            concise: "concise et percutante — maximum 3 paragraphes courts",
        };
        const achievementsHint = userAchievements.length
            ? `Mets en avant ces réalisations : ${userAchievements.join(", ")}.`
            : "";

        const prompt = `Écris une lettre de motivation ${toneGuide[tone] ?? toneGuide.professional}.
${achievementsHint}
Utilise la même langue que le CV.

=== CV ===
${cvText.slice(0, 3000)}

=== OFFRE ===
${offreText.slice(0, 1500)}

Retourne UNIQUEMENT le texte de la lettre, sans objet ni markdown.`;
        const content = await this.provider.generateText(prompt, { maxTokens: 800 });
        return { content: content.trim() };
    }

    async refineCoverLetter(params: { currentLetter: string; feedback: string; offreText: string }) {
        const prompt = `Améliore cette lettre de motivation selon ce feedback.

Lettre actuelle:
${params.currentLetter}

Feedback:
${params.feedback}

Contexte offre:
${params.offreText.slice(0, 500)}

Retourne UNIQUEMENT la lettre révisée, sans markdown.`;
        const content = await this.provider.generateText(prompt, { maxTokens: 800 });
        return { content: content.trim() };
    }

    async suggestCvImprovements(cvText: string, offreText: string) {
        const prompt = `Tu es un expert CV. Analyse ce CV par rapport à cette offre et propose des améliorations concrètes.

=== CV ===
${cvText.slice(0, 3000)}

=== OFFRE ===
${offreText.slice(0, 1500)}

Retourne UNIQUEMENT ce JSON :
{
  "suggestedSummary": "Nouveau résumé professionnel adapté à cette offre...",
  "suggestedSkillsToAdd": ["skill1", "skill2", "skill3"],
  "suggestedProjectsDescription": "Description suggérée pour mettre en valeur les projets...",
  "sectionImprovements": [
    {
      "section": "Experience",
      "current": "Texte actuel...",
      "suggested": "Version améliorée...",
      "reason": "Raison de l'amélioration"
    }
  ],
  "overallAdvice": "Conseil général en 2-3 phrases."
}`;
        return this.provider.generateJson<any>(prompt, { maxTokens: 1200 });
    }
}