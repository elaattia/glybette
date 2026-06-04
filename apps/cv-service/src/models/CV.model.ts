import mongoose, { Schema, type Document } from "mongoose";
import { CV_TEMPLATE_IDS, CV_SECTION_TYPES } from "@glybette/types";

const CvSectionSchema = new Schema(
    {
        type: { type: String, enum: CV_SECTION_TYPES, required: true },
        order: { type: Number, required: true },
        label: { type: String },
        data: { type: Schema.Types.Mixed, required: true },
    },
    { _id: false },
);

const AtsScoreSchema = new Schema(
    {
        score: { type: Number, min: 0, max: 100 },
        missingKeywords: [String],
        matchedKeywords: [String],
        suggestions: [String],
        strengths: [String],
        weaknesses: [String],
        tips: [String],
        breakdown: {
            keywordMatch: Number,
            formatting: Number,
            completeness: Number,
            relevance: Number,
        },
    },
    { _id: false },
);

export interface CvDoc extends Document {
    userId: string;
    title: string;
    template: string;
    theme?: {
        accentColor?: string;
        fontFamily?: string;
        fontSize?: string;
    };
    sections: Array<{ type: string; order: number; label?: string; data: unknown }>;
    atsScore?: {
        score: number;
        missingKeywords: string[];
        matchedKeywords: string[];
        suggestions: string[];
        strengths?: string[];
        weaknesses?: string[];
        tips?: string[];
        breakdown: { keywordMatch: number; formatting: number; completeness: number; relevance: number };
    };
    atsScoreCvOnly?: {
        score: number;
        missingKeywords: string[];
        matchedKeywords: string[];
        suggestions: string[];
        strengths?: string[];
        weaknesses?: string[];
        tips?: string[];
        breakdown: { keywordMatch: number; formatting: number; completeness: number; relevance: number };
    };
    pdfUrl?: string;
    shareToken?: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CvSchema = new Schema<CvDoc>(
    {
        userId: { type: String, required: true, index: true },
        title: { type: String, required: true, trim: true, maxlength: 120, default: "Mon CV" },
        template: { type: String, required: true, enum: CV_TEMPLATE_IDS, default: "modern-strategy" },
        theme: {
            accentColor: String,
            fontFamily: String,
            fontSize: { type: String, enum: ["small", "medium", "large"] },
        },
        sections: { type: [CvSectionSchema], default: [] },
        atsScore: { type: AtsScoreSchema },
        atsScoreCvOnly: { type: AtsScoreSchema },
        pdfUrl: { type: String },
        shareToken: { type: String, sparse: true, index: true },
        isPublic: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

CvSchema.index({ userId: 1, updatedAt: -1 });

export const CvModel = mongoose.model<CvDoc>("Cv", CvSchema);