import { randomBytes } from "crypto";
import { CvModel } from "../models/CV.model.js";
import { makeDefaultSections } from "./cv.defaults.js";
import type { AtsScoreData } from "@glybette/types";

export interface CreateCvDto {
    title: string;
    template: string;
    sections?: unknown[];
}

export interface UpdateCvDto {
    title?: string;
    template?: string;
    sections?: unknown[];
    pdfUrl?: string;
    isPublic?: boolean;
    shareToken?: string | null;
}

export class CvRepository {
    findAllByUser(userId: string) {
        return CvModel.find({ userId }).sort({ updatedAt: -1 }).lean();
    }

    findById(id: string, userId: string) {
        return CvModel.findOne({ _id: id, userId }).lean();
    }

    findByShareToken(token: string) {
        return CvModel.findOne({ shareToken: token, isPublic: true }).lean();
    }

    async create(userId: string, dto: CreateCvDto) {
        const cv = new CvModel({
            userId,
            title: dto.title,
            template: dto.template,
            sections: dto.sections?.length ? dto.sections : makeDefaultSections(),
        });
        return cv.save();
    }

    update(id: string, userId: string, dto: UpdateCvDto) {
        const setFields: Partial<UpdateCvDto> = { ...dto };
        const unsetFields: Record<string, 1> = {};

        if (dto.shareToken === null) {
            delete setFields.shareToken;
            unsetFields.shareToken = 1;
        }

        return CvModel.findOneAndUpdate(
            { _id: id, userId },
            {
                $set: setFields,
                ...(Object.keys(unsetFields).length ? { $unset: unsetFields } : {}),
            },
            { new: true, runValidators: true },
        ).lean();
    }

    updateAtsScore(id: string, userId: string, atsScore: AtsScoreData) {
        return CvModel.findOneAndUpdate({ _id: id, userId }, { $set: { atsScore } }, { new: true }).lean();
    }

    updateAtsScoreCvOnly(id: string, userId: string, atsScore: AtsScoreData) {
        return CvModel.findOneAndUpdate(
            { _id: id, userId },
            { $set: { atsScoreCvOnly: atsScore } },
            { new: true },
        ).lean();
    }

    async delete(id: string, userId: string) {
        const r = await CvModel.deleteOne({ _id: id, userId });
        return r.deletedCount > 0;
    }

    countByUser(userId: string) {
        return CvModel.countDocuments({ userId });
    }

    async duplicate(id: string, userId: string) {
        const orig = await this.findById(id, userId);
        if (!orig) return null;
        const copy = new CvModel({
            userId,
            title: `${orig.title} (Copie)`,
            template: orig.template,
            sections: orig.sections,
        });
        return copy.save();
    }

    async generateShareToken(id: string, userId: string) {
        const token = randomBytes(20).toString("hex");
        return CvModel.findOneAndUpdate(
            { _id: id, userId },
            { $set: { shareToken: token, isPublic: true } },
            { new: true },
        ).lean();
    }

    async revokeShare(id: string, userId: string) {
        return CvModel.findOneAndUpdate(
            { _id: id, userId },
            { $unset: { shareToken: 1 }, $set: { isPublic: false } },
            { new: true },
        ).lean();
    }


    adminList(limit: number) {
        return CvModel.find({}).sort({ updatedAt: -1 }).limit(limit).lean();
    }

    adminFindById(id: string) {
        return CvModel.findById(id).lean();
    }

    async adminDelete(id: string) {
        const r = await CvModel.deleteOne({ _id: id });
        return r.deletedCount > 0;
    }
}

