import { MatchingModel, type MatchingDoc } from "../models/Matching.model.js";
import { OffreModel } from "../models/Offre.model.js";
import { AiClient } from "./ai.client.js";

const ai = new AiClient();

export class MatchingService {
    async get(userId: string, offreId: string): Promise<MatchingDoc | null> {
        return MatchingModel.findOne({ userId, offreId });
    }

    async getOrCompute(userId: string, offreId: string, userProfile: UserProfile): Promise<MatchingDoc> {
        const existing = await this.get(userId, offreId);
        if (existing) return existing;

        return this.compute(userId, offreId, userProfile);
    }

    async compute(userId: string, offreId: string, userProfile: UserProfile) {
        const offre = await OffreModel.findById(offreId);
        if (!offre) throw Object.assign(new Error("Offre not found"), { status: 404 });

        const offreText = buildOffreText(offre);
        const profileText = buildProfileText(userProfile);

        const result = await ai.computeMatching(profileText, offreText);

        return MatchingModel.findOneAndUpdate(
            { userId, offreId },
            {
                $set: {
                    score: result.score,
                    pointsForts: result.pointsForts,
                    pointsFaibles: result.pointsFaibles,
                    recommandations: result.recommandations,
                    skillsManquantes: result.skillsManquantes,
                    skillsCorrespondantes: result.skillsCorrespondantes,
                    explication: result.explication,
                    computedAt: new Date(),
                },
            },
            { upsert: true, new: true },
        );
    }

    async getTopMatchesForUser(userId: string, userProfile: UserProfile, limit = 3) {
        // Prefetch recent pool; only up to `limit` uncached offres get AI scoring per request.
        const offres = await OffreModel.find({ status: "active" })
            .sort({ date_scraped: -1 })
            .limit(100)
            .lean();

        const existingMatchings = await MatchingModel.find({ userId }).lean();
        const matchedIds = new Set(existingMatchings.map((m) => m.offreId.toString()));

        const toProcess = offres.filter((o) => !matchedIds.has(o._id.toString())).slice(0, limit);

        const results = await Promise.allSettled(
            toProcess.map((o) => this.compute(userId, o._id.toString(), userProfile)),
        );

        const computed = results
            .filter((r) => r.status === "fulfilled")
            .map((r) => (r as PromiseFulfilledResult<any>).value);

        const all = [...existingMatchings, ...computed].sort((a, b) => b.score - a.score);
        const topMatches = all.slice(0, limit);

        const topOffreIds = topMatches.map(m => m.offreId);
        const topOffres = await OffreModel.find({ _id: { $in: topOffreIds } }).lean();
        const offreMap = new Map(topOffres.map(o => [o._id.toString(), o]));

        return topMatches.map(match => ({
            match,
            offre: offreMap.get(match.offreId.toString())
        })).filter(item => item.offre != null);
    }
}

interface UserProfile {
    skills: string[];
    experience: Array<{ position: string; company: string; description: string }>;
    education: Array<{ degree: string; field: string; institution: string }>;
    summary?: string;
    lookingFor?: string[];
    languages?: Array<{ language: string; level: string }>;
}

function buildOffreText(offre: any): string {
    return [
        `Title: ${offre.titre}`,
        offre.entreprise ? `Company: ${offre.entreprise}` : "",
        offre.description ? `Description: ${offre.description}` : "",
        offre.competences?.length ? `Required skills: ${offre.competences.join(", ")}` : "",
        offre.localisation ? `Location: ${offre.localisation}` : "",
        offre.niveau_experience ? `Experience level: ${offre.niveau_experience}` : "",
        offre.type_contrat ? `Contract: ${offre.type_contrat}` : "",
    ]
        .filter(Boolean)
        .join("\n");
}

function buildProfileText(profile: UserProfile): string {
    return [
        profile.summary ? `Summary: ${profile.summary}` : "",
        profile.skills?.length ? `Skills: ${profile.skills.join(", ")}` : "",
        profile.experience?.length
            ? `Experience:\n${profile.experience.map((e) => `  - ${e.position} @ ${e.company}: ${e.description}`).join("\n")}`
            : "",
        profile.education?.length
            ? `Education:\n${profile.education.map((e) => `  - ${e.degree} ${e.field} @ ${e.institution}`).join("\n")}`
            : "",
        profile.languages?.length ? `Languages: ${profile.languages.map((l) => `${l.language} (${l.level})`).join(", ")}` : "",
        profile.lookingFor?.length ? `Looking for: ${profile.lookingFor.join(", ")}` : "",
    ]
        .filter(Boolean)
        .join("\n");
}