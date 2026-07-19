import fs from "node:fs/promises";
import path from "node:path";
import { Hono } from "hono";
import { OffreModel } from "../models/Offre.model.js";
import { ApplicationModel } from "../models/Application.model.js";

function buildDatePostedFilter(datePosted: string): Record<string, unknown> | null {
    const deltasMs: Record<string, number> = {
        this_hour: 60 * 60 * 1000,
        today: 24 * 60 * 60 * 1000,
        "3days": 3 * 24 * 60 * 60 * 1000,
        this_week: 7 * 24 * 60 * 60 * 1000,
    };
    const ms = deltasMs[datePosted];
    if (ms === undefined) return null;
    const since = new Date(Date.now() - ms);
    return {
        $or: [
            { date_publication: { $gte: since, $ne: null } },
            {
                date_publication: { $in: [null] },
                date_scraped: { $gte: since },
            },
        ],
    };
}

const TELETRAVAIL_PATTERNS: Record<string, string> = {
    remote: String.raw`remote|full\s*remote|télétravail\s*complet|100\s*%`,
    hybrid: String.raw`hybride|hybrid|télétravail\s*partiel|partiel`,
    onsite: String.raw`présentiel|on[\-\s]site|sur\s*site|pas\s*de\s*télétravail|non\s*autorisé`,
};

const EXPERIENCE_PATTERNS: Record<string, string> = {
    junior: String.raw`junior|<\s*6\s*mois|0[\-–]1\s*an|débutant|entry\s*level`,
    mid: String.raw`1[\-–]3\s*ans|2[\-–]3\s*ans|intermédiaire|confirmé|mid`,
    senior: String.raw`senior|3\+?\s*ans|5\+?\s*ans|expert|lead|expérimenté`,
};

export const jobsController = new Hono();
export const jobsAdminController = new Hono();
export const jobsEnterpriseController = new Hono();

function requireAdmin(c: any): void {
    const isAdmin = Boolean(c.get("isAdmin"));
    if (!isAdmin) {
        throw Object.assign(new Error("Admin role required"), { status: 403 });
    }
}

jobsController.get("/offres", async (c) => {
    const {
        type_offre, source, localisation, search, page = "1", limit = "20",
        tri = "recent", date_posted, teletravail, niveau_experience,
    } = c.req.query();

    const filtre: Record<string, unknown> = { status: "active" };
    if (type_offre) filtre.type_offre = type_offre;
    if (source) {
        if (source === "scraped") {
            filtre.source_site = { $ne: "entreprise_partenaire" };
        } else {
            filtre.source_site = source;
        }
    }
    if (localisation) filtre.localisation = { $regex: localisation, $options: "i" };
    if (search) filtre.$text = { $search: search };
    if (teletravail) {
        const pattern = TELETRAVAIL_PATTERNS[teletravail] ?? teletravail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filtre.teletravail = { $regex: pattern, $options: "i" };
    }
    if (niveau_experience) {
        const pattern =
            EXPERIENCE_PATTERNS[niveau_experience] ??
            niveau_experience.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filtre.niveau_experience = { $regex: pattern, $options: "i" };
    }
    if (date_posted) {
        const df = buildDatePostedFilter(date_posted);
        if (df) {
            const existing = filtre.$and;
            const andArr = Array.isArray(existing) ? [...existing] : [];
            andArr.push(df);
            filtre.$and = andArr;
        }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);

    const sort: any = tri === "vues" ? { nb_vues: -1 } : { date_scraped: -1 };

    const [total, docs] = await Promise.all([
        OffreModel.countDocuments(filtre),
        OffreModel.find(filtre, { description: 0, company_about: 0 })
            .sort(sort)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean(),
    ]);

    return c.json({
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        offres: docs,
    });
});

jobsController.get("/offres/:id", async (c) => {
    const offre = await OffreModel.findByIdAndUpdate(
        c.req.param("id"),
        { $inc: { nb_vues: 1 } },
        { new: true },
    ).lean();
    if (!offre) return c.json({ error: "Offre not found" }, 404);
    return c.json({ offre });
});

jobsController.get("/uploads/:fileName", async (c) => {
    const rawFileName = c.req.param("fileName");
    const fileName = path.basename(rawFileName);
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, fileName);

    try {
        const file = await fs.readFile(filePath);
        return c.body(file, 200, {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${fileName}"`,
        });
    } catch (err) {
        return c.json({ error: "File not found" }, 404);
    }
});

jobsController.get("/stats", async (c) => {
    const [total, par_type, par_source] = await Promise.all([
        OffreModel.countDocuments({ status: "active" }),
        OffreModel.aggregate([
            { $match: { status: "active" } },
            { $group: { _id: "$type_offre", count: { $sum: 1 } } },
        ]),
        OffreModel.aggregate([
            { $match: { status: "active" } },
            { $group: { _id: "$source_site", count: { $sum: 1 } } },
        ]),
    ]);

    return c.json({
        total_actives: total,
        par_type: Object.fromEntries(par_type.map((r) => [r._id, r.count])),
        par_source: Object.fromEntries(par_source.map((r) => [r._id, r.count])),
    });
});

jobsController.post("/offres/:id/click", async (c) => {
    await OffreModel.findByIdAndUpdate(c.req.param("id"), { $inc: { nb_clics: 1 } });
    return c.json({ ok: true });
});

jobsAdminController.get("/admin/offres", async (c) => {
    requireAdmin(c);
    const limit = Math.min(Math.max(1, Number(c.req.query("limit") ?? "100")), 250);
    const offres = await OffreModel.find({})
        .sort({ date_scraped: -1 })
        .limit(limit)
        .lean();
    return c.json({ offres });
});

jobsAdminController.patch("/admin/offres/:id/status", async (c) => {
    requireAdmin(c);
    const body = (await c.req.json().catch(() => null)) as { status?: "active" | "archivee" } | null;
    if (!body?.status || !["active", "archivee"].includes(body.status)) {
        return c.json({ error: "Invalid status" }, 400);
    }
    const offre = await OffreModel.findByIdAndUpdate(
        c.req.param("id"),
        { $set: { status: body.status, date_updated: new Date() } },
        { new: true },
    ).lean();
    if (!offre) return c.json({ error: "Offre not found" }, 404);
    return c.json({ offre });
});

jobsAdminController.delete("/admin/offres/:id", async (c) => {
    requireAdmin(c);
    const result = await OffreModel.deleteOne({ _id: c.req.param("id") });
    if (!result.deletedCount) {
        return c.json({ error: "Offre not found" }, 404);
    }
    return c.json({ ok: true });
});

jobsEnterpriseController.get("/my-offres", async (c: any) => {
    try {
        const userId = c.get("userId");

        if (!userId) {
            return c.json({ error: "User not authenticated" }, 401);
        }

        const offres = await OffreModel.find({
            createdBy: userId,
            source_site: "entreprise_partenaire",
        })
            .sort({ date_scraped: -1 })
            .lean();

        const offresWithCounts = await Promise.all(
            offres.map(async (offre) => {
                const nb_candidats = await ApplicationModel.countDocuments({
                    offreId: offre._id.toString(),
                });

                return {
                    ...offre,
                    nb_candidats,
                };
            }),
        );

        return c.json({
            offres: offresWithCounts,
        });
    } catch (error) {
        return c.json({ error: "Failed to fetch offres" }, 500);
    }
});

jobsEnterpriseController.post("/", async (c: any) => {
    const body = await c.req.json().catch(() => null);

    if (!body || !body.titre) {
        return c.json(
            { error: "Invalid payload, title required" },
            400,
        );
    }

    const { randomUUID } = await import("node:crypto");

    const newOffer = new OffreModel({

        hash_unique: `ent-${randomUUID()}`,

        titre: body.titre,

        entreprise:
            body.entreprise ||
            "Entreprise partenaire",

        description:
            body.description || "",

        competences:
            Array.isArray(body.competences)
                ? body.competences
                : [],

        localisation:
            body.localisation || "",

        salaire:
            body.salaire || "",

        type_contrat:
            body.type_contrat || "",

        lien_original:
            body.lien_original ||
            "#",

        type_offre:
            body.type_offre || "emploi",

        domaine:
            body.domaine || "",

        source_site:
            "entreprise_partenaire",

        status: "active",

        date_publication:
            new Date(),

        date_scraped:
            new Date(),

        date_updated:
            new Date(),

        nb_vues: 0,

        nb_clics: 0,

        niveau_experience:
            body.niveau_experience || "",

        teletravail:
            body.teletravail || "",

        createdBy: c.get("userId"),
    });

    await newOffer.save();

    return c.json(
        {
            success: true,
            offre: newOffer,
        },
        201,
    );
});

export const applicationController = new Hono();

applicationController.post("/", async (c: any) => {
    try {
        const userId = c.get("userId");
        if (!userId) {
            return c.json({ error: "User not authenticated" }, 401);
        }

        const formData = await (c.req as any).formData().catch(() => null) as any;
        const offreId = formData?.get("offreId")?.toString?.();
        const resumeFile = formData?.get("resume") as any;
        const coverLetterFile = formData?.get("coverLetter") as any;

        if (!offreId || !resumeFile || !coverLetterFile) {
            return c.json({ error: "Missing required fields: offreId, resume, coverLetter" }, 400);
        }

        const validPdf = (file: any) =>
            file?.type === "application/pdf" ||
            typeof file?.name === "string" && file.name.toLowerCase().endsWith(".pdf");

        if (!validPdf(resumeFile) || !validPdf(coverLetterFile)) {
            return c.json({ error: "Resume and cover letter must be PDF files" }, 400);
        }

        const uploadDir = path.join(process.cwd(), "uploads");
        await fs.mkdir(uploadDir, { recursive: true });

        const makeFileName = (prefix: string, file: any) => {
            const base = path.basename(file.name || `${prefix}.pdf`).replace(/[^a-zA-Z0-9_.-]/g, "_");
            return `${prefix}-${userId}-${Date.now()}-${base}`;
        };

        const resumeName = makeFileName("resume", resumeFile);
        const coverLetterName = makeFileName("cover-letter", coverLetterFile);
        const resumePath = path.join(uploadDir, resumeName);
        const coverLetterPath = path.join(uploadDir, coverLetterName);

        await fs.writeFile(resumePath, Buffer.from(await resumeFile.arrayBuffer()));
        await fs.writeFile(coverLetterPath, Buffer.from(await coverLetterFile.arrayBuffer()));

        const resumeUrl = `/api/jobs/uploads/${encodeURIComponent(resumeName)}`;
        const coverLetterUrl = `/api/jobs/uploads/${encodeURIComponent(coverLetterName)}`;

        const { applicationService } = await import("../services/application.service.js");
        const application = await applicationService.submitApplication(
            userId,
            offreId,
            "",
            resumeUrl,
            coverLetterUrl,
        );

        return c.json({ success: true, application }, 201);
    } catch (error: any) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[jobs-service] POST /applications error:", message, error?.stack ?? "");
        if (error.status) {
            return c.json({ error: error.message }, error.status);
        }
        return c.json({ error: "Failed to submit application" }, 500);
    }
});

applicationController.get("/user/my-applications", async (c: any) => {
    try {
        const userId = c.get("userId");
        if (!userId) {
            return c.json({ error: "User not authenticated" }, 401);
        }

        const { applicationService } = await import("../services/application.service.js");
        const applications = await applicationService.getUserApplications(userId);

        return c.json({ applications });
    } catch (error) {
        return c.json({ error: "Failed to fetch applications" }, 500);
    }
});

applicationController.get("/offre/:offreId", async (c: any) => {
    try {
        const offreId = c.req.param("offreId");
        const status = c.req.query("status");

        const { applicationService } = await import("../services/application.service.js");
        const applications = await applicationService.getApplicationsByOffre(offreId, status);

        return c.json({ applications });
    } catch (error) {
        return c.json({ error: "Failed to fetch applications" }, 500);
    }
});

applicationController.get("/enterprise/all", async (c: any) => {
    try {
        const userId = c.get("userId");

        if (!userId) {
            return c.json({ error: "User not authenticated" }, 401);
        }

        const offres = await OffreModel.find({
            createdBy: userId,
            source_site: "entreprise_partenaire",
        }).select("_id").lean();

        const offreIds = offres.map((o) => o._id.toString());

        const { applicationService } = await import("../services/application.service.js");
        const applications = await applicationService.getEnterpriseApplications(offreIds);
        const stats = await applicationService.getEnterpriseStats(offreIds);

        return c.json({ applications, stats });
    } catch (error) {
        return c.json({ error: "Failed to fetch applications" }, 500);
    }
});

applicationController.patch("/:applicationId/status", async (c: any) => {
    try {
        const applicationId = c.req.param("applicationId");
        const body = await c.req.json().catch(() => null);

        if (!body || !body.status) {
            return c.json({ error: "Missing status field" }, 400);
        }

        const { applicationService } = await import("../services/application.service.js");
        const updated = await applicationService.updateApplicationStatus(
            applicationId,
            body.status,
            body.recruiterNotes,
            body.rating,
            c.get("userId"),
        );

        if (!updated) {
            return c.json({ error: "Application not found" }, 404);
        }

        return c.json({ success: true, application: updated });
    } catch (error) {
        return c.json({ error: "Failed to update application" }, 500);
    }
});

applicationController.get("/offre/:offreId/user", async (c: any) => {
    try {
        const userId = c.get("userId");
        if (!userId) {
            return c.json({ error: "User not authenticated" }, 401);
        }

        const offreId = c.req.param("offreId");
        const { applicationService } = await import("../services/application.service.js");
        const application = await applicationService.getUserApplicationForOffre(userId, offreId);

        return c.json({ application });
    } catch (error) {
        return c.json({ error: "Failed to fetch user application" }, 500);
    }
});

applicationController.get("/:applicationId", async (c: any) => {
    try {
        const applicationId = c.req.param("applicationId");
        const { applicationService } = await import("../services/application.service.js");
        const application = await applicationService.getApplicationDetails(applicationId);

        if (!application) {
            return c.json({ error: "Application not found" }, 404);
        }

        return c.json({ application });
    } catch (error) {
        return c.json({ error: "Failed to fetch application" }, 500);
    }
});