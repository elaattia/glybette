import mongoose, { Schema, type Document } from "mongoose";

export interface ApplicationDoc extends Document {
    userId: string;
    offreId: string;
    status: "pending" | "viewed" | "accepted" | "rejected";
    appliedAt: Date;
    coverLetter: string;
    resumeUrl?: string;
    coverLetterUrl?: string;
    recruiterNotes?: string;
    rating?: number;
    reviewedAt?: Date;
    reviewedBy?: string;
}

const ApplicationSchema = new Schema<ApplicationDoc>(
    {
        userId: { type: String, required: true, index: true },
        offreId: { type: String, required: true, index: true },
        status: {
            type: String,
            enum: ["pending", "viewed", "accepted", "rejected"],
            default: "pending",
        },
        appliedAt: { type: Date, default: Date.now, index: true },
        coverLetter: { type: String, default: "" },
        resumeUrl: String,
        coverLetterUrl: String,
        recruiterNotes: String,
        rating: { type: Number, min: 0, max: 5 },
        reviewedAt: Date,
        reviewedBy: String,
    },
    { timestamps: true },
);

ApplicationSchema.index({ userId: 1, offreId: 1 }, { unique: true });
ApplicationSchema.index({ offreId: 1, status: 1 });
ApplicationSchema.index({ userId: 1, status: 1 });

export const ApplicationModel = mongoose.model<ApplicationDoc>(
    "Application",
    ApplicationSchema,
);
