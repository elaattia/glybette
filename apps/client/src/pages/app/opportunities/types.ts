import type { Offre } from "@glybette/types";

export type { Offre };

export interface OffreWithScore extends Offre {
    _matchScore?: number;
    _localScore?: number;
}

export interface Matching {
    score: number;
    pointsForts: string[];
    pointsFaibles: string[];
    recommandations: string[];
    skillsManquantes: string[];
    skillsCorrespondantes: string[];
    explication: string;
}

export interface InterviewQuestions {
    behavioural: string[];
    technical: string[];
    situational: string[];
    tips: string[];
}

export interface AnswerEval {
    score: number;
    strengths: string[];
    improvements: string[];
    suggestedAnswer: string;
    keywords: string[];
}

export interface CvImprovement {
    suggestedSummary: string;
    suggestedSkillsToAdd: string[];
    suggestedProjectsDescription: string;
    sectionImprovements: Array<{
        section: string;
        current: string;
        suggested: string;
        reason: string;
    }>;
    overallAdvice: string;
    atsScoreEstimate?: number;
    keywordsToAdd?: string[];
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}