import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { CvService } from "../services/cv.service.js";
import { CV_TEMPLATE_IDS } from "@glybette/types";

const svc = new CvService();
export const cvService = svc;
export const cvController = new Hono();

function uid(c: { get: (k: string) => unknown }): string {
    const id = c.get("userId") as string | undefined;
    if (!id) throw Object.assign(new Error("Unauthorized"), { status: 401 });
    return id;
}

function requireAdmin(c: { get: (k: string) => unknown }): void {
    if (!Boolean(c.get("isAdmin"))) {
        throw Object.assign(new Error("Forbidden"), { status: 403 });
    }
}

function shape(doc: any) {
    return {
        _id: String(doc._id),
        userId: doc.userId,
        owner: doc.owner,
        title: doc.title,
        template: doc.template,
        sections: doc.sections ?? [],
        atsScore: doc.atsScore?.score,
        atsScoreCvOnly: doc.atsScoreCvOnly?.score,   
        pdfUrl: doc.pdfUrl,
        shareToken: doc.shareToken,
        isPublic: doc.isPublic ?? false,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}

const CreateCvSchema = z.object({
    title: z.string().min(1).max(120).default("Mon CV"),
    template: z.enum(CV_TEMPLATE_IDS).default("modern-strategy"),
    sections: z.array(z.any()).optional(),
});

const UpdateCvSchema = z.object({
    title: z.string().min(1).max(120).optional(),
    template: z.enum(CV_TEMPLATE_IDS).optional(),
    sections: z.array(z.any()).optional(),
    isPublic: z.boolean().optional(),
});

cvController.post("/extract", zValidator("json", z.object({ text: z.string().min(1) })), async (c) => {
    const result = await svc.extractFromText(c.req.valid("json").text);
    return c.json(result);
});

cvController.post(
    "/suggest-skills",
    zValidator(
        "json",
        z.object({
            role: z.string().min(1),
            existingSkills: z.array(z.string()).default([]),
        }),
    ),
    async (c) => {
        const { role, existingSkills } = c.req.valid("json");
        return c.json(await svc.suggestSkills(role, existingSkills));
    },
);

cvController.get("/admin/overview-stats", async (c) => {
    requireAdmin(c);
    return c.json(await svc.getAdminOverviewStats());
});

cvController.get("/admin/list", async (c) => {
    requireAdmin(c);
    const limit = Number(c.req.query("limit") ?? "100");
    const docs = await svc.adminListCvs(Number.isFinite(limit) ? limit : 100);
    return c.json({ cvs: docs.map(shape) });
});

cvController.get("/admin/:id", async (c) => {
    requireAdmin(c);
    const doc = await svc.adminGetCv(c.req.param("id"));
    return c.json({ cv: shape(doc) });
});

cvController.delete("/admin/:id", async (c) => {
    requireAdmin(c);
    await svc.adminDeleteCv(c.req.param("id"));
    return c.json({ ok: true });
});

cvController.get("/", async (c) => {
    const docs = await svc.getUserCvs(uid(c));
    return c.json({ cvs: docs.map(shape) });
});

cvController.get("/:id", async (c) => {
    const doc = await svc.getCvById(c.req.param("id"), uid(c));
    return c.json({ cv: shape(doc) });
});

cvController.post("/", zValidator("json", CreateCvSchema), async (c) => {
    const doc = await svc.createCv(uid(c), c.req.valid("json"));
    return c.json({ cv: shape(doc) }, 201);
});

cvController.patch("/:id", zValidator("json", UpdateCvSchema), async (c) => {
    const doc = await svc.updateCv(c.req.param("id"), uid(c), c.req.valid("json"));
    return c.json({ cv: shape(doc) });
});

cvController.delete("/:id", async (c) => {
    await svc.deleteCv(c.req.param("id"), uid(c));
    return c.json({ success: true });
});

cvController.post("/:id/duplicate", async (c) => {
    const doc = await svc.duplicateCv(c.req.param("id"), uid(c));
    return c.json({ cv: shape(doc) }, 201);
});

cvController.post("/:id/pdf", async (c) => {
    const result = await svc.exportPdf(c.req.param("id"), uid(c));
    return c.json(result);
});

cvController.post("/:id/share", async (c) => {
    const result = await svc.sharePublic(c.req.param("id"), uid(c));
    return c.json(result);
});

cvController.delete("/:id/share", async (c) => {
    const doc = await svc.revokeShare(c.req.param("id"), uid(c));
    return c.json({ cv: shape(doc) });
});

cvController.post("/:id/ats-score-cv", async (c) => {
    const result = await svc.scoreAtsCvOnly(c.req.param("id"), uid(c));
    return c.json(result);
});

cvController.post("/:id/ats-score", zValidator("json", z.object({ jobDescription: z.string().min(1) })), async (c) => {
    const result = await svc.scoreAts(c.req.param("id"), uid(c), c.req.valid("json").jobDescription);
    return c.json(result);
});

cvController.post(
    "/:id/suggest-improvements",
    zValidator("json", z.object({ targetRole: z.string().optional() })),
    async (c) => {
        const result = await svc.suggestImprovements(c.req.param("id"), uid(c), c.req.valid("json").targetRole);
        return c.json(result);
    },
);

cvController.post(
    "/:id/enhance-section",
    zValidator(
        "json",
        z.object({
            text: z.string().min(1),
            sectionType: z.string(),
        }),
    ),
    async (c) => {
        const { text, sectionType } = c.req.valid("json");
        const result = await svc.enhanceSection(c.req.param("id"), uid(c), text, sectionType);
        return c.json(result);
    },
);

cvController.post("/:id/tailor", zValidator("json", z.object({ jobDescription: z.string().min(1) })), async (c) => {
    const result = await svc.tailorCv(c.req.param("id"), uid(c), c.req.valid("json").jobDescription);
    return c.json(result);
});

cvController.post(
    "/:id/cover-letter",
    zValidator(
        "json",
        z.object({
            jobDescription: z.string().min(1),
            tone: z.enum(["professional", "enthusiastic", "concise"]).default("professional"),
        }),
    ),
    async (c) => {
        const { jobDescription, tone } = c.req.valid("json");
        const result = await svc.generateCoverLetter(c.req.param("id"), uid(c), jobDescription, tone);
        return c.json(result);
    },
);