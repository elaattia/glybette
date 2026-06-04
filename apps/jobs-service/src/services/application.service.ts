import { ApplicationModel, type ApplicationDoc } from "../models/Application.model.js";
import { OffreModel } from "../models/Offre.model.js";

export const applicationService = {
    async submitApplication(
        userId: string,
        offreId: string,
        coverLetter: string,
        resumeUrl?: string,
        coverLetterUrl?: string,
    ): Promise<ApplicationDoc> {
        const offre = await OffreModel.findById(offreId);
        if (!offre) {
            throw Object.assign(new Error("Offre not found"), { status: 404 });
        }

        const existing = await ApplicationModel.findOne({ userId, offreId });
        if (existing) {
            throw Object.assign(new Error("You have already applied to this job"), { status: 400 });
        }

        const application = new ApplicationModel({
            userId,
            offreId,
            coverLetter,
            resumeUrl,
            coverLetterUrl,
            status: "pending",
            appliedAt: new Date(),
        });

        return application.save();
    },

    async getApplicationsByOffre(offreId: string, status?: string) {
        const filter: any = { offreId };
        if (status) filter.status = status;

        return ApplicationModel.find(filter)
            .sort({ appliedAt: -1 })
            .lean();
    },

    async getEnterpriseApplications(
        offreIds: string[],
        status?: string,
    ) {
        const filter: any = { offreId: { $in: offreIds } };
        if (status) filter.status = status;

        const applications = await ApplicationModel.find(filter)
            .sort({ appliedAt: -1 })
            .lean();

        const offres = await OffreModel.find({
            _id: { $in: offreIds },
        }).lean();

        const offreMap = new Map(offres.map((o) => [o._id.toString(), o]));

        return applications.map((app) => ({
            ...app,
            offre: offreMap.get(app.offreId.toString()),
        }));
    },

    async getUserApplications(userId: string) {
        return ApplicationModel.find({ userId })
            .populate("offreId")
            .sort({ appliedAt: -1 })
            .lean();
    },

    async getUserApplicationForOffre(userId: string, offreId: string) {
        return ApplicationModel.findOne({ userId, offreId }).lean();
    },

    async updateApplicationStatus(
        applicationId: string,
        status: "pending" | "viewed" | "accepted" | "rejected",
        recruiterNotes?: string,
        rating?: number,
        reviewedBy?: string,
    ) {
        return ApplicationModel.findByIdAndUpdate(
            applicationId,
            {
                status,
                recruiterNotes,
                rating,
                reviewedAt: new Date(),
                reviewedBy,
            },
            { new: true },
        ).lean();
    },

    async getApplicationDetails(applicationId: string) {
        return ApplicationModel.findById(applicationId)
            .populate("offreId")
            .lean();
    },

    async getApplicationStats(offreId: string) {
        const stats = await ApplicationModel.aggregate([
            { $match: { offreId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        return Object.fromEntries(
            stats.map((s) => [s._id, s.count]),
        );
    },

    async getEnterpriseStats(offreIds: string[]) {
        return ApplicationModel.aggregate([
            { $match: { offreId: { $in: offreIds } } },
            {
                $group: {
                    _id: { offreId: "$offreId", status: "$status" },
                    count: { $sum: 1 },
                },
            },
        ]);
    },
};
