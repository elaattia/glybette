import { Hono } from "hono";
import { OffreModel } from "../models/Offre.model.js";

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

jobsController.get("/offres", async (c) => {
    const {
        type_offre, source, localisation, search, page = "1", limit = "20",
        tri = "recent", date_posted, teletravail, niveau_experience,
    } = c.req.query();

    const filtre: Record<string, unknown> = { status: "active" };
    if (type_offre) filtre.type_offre = type_offre;
    if (source) filtre.source_site = source;
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