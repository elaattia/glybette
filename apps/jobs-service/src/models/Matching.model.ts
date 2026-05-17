import mongoose, { Schema, type Document } from "mongoose";

export interface MatchingDoc extends Document {
    userId: string;
    offreId: string;
    score: number; 
    pointsForts: string[];
    pointsFaibles: string[];
    recommandations: string[];
    skillsManquantes: string[];
    skillsCorrespondantes: string[];
    explication: string;
    computedAt: Date;
}

const MatchingSchema = new Schema<MatchingDoc>({
    userId: { type: String, required: true, index: true },
    offreId: { type: String, required: true, index: true },
    score: { type: Number, min: 0, max: 100 },
    pointsForts: [String],
    pointsFaibles: [String],
    recommandations: [String],
    skillsManquantes: [String],
    skillsCorrespondantes: [String],
    explication: String,
    computedAt: { type: Date, default: Date.now },
});

MatchingSchema.index({ userId: 1, offreId: 1 }, { unique: true });
MatchingSchema.index({ userId: 1, score: -1 });

export const MatchingModel = mongoose.model<MatchingDoc>("Matching", MatchingSchema);