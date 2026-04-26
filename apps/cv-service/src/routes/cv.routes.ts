import { Hono } from "hono";
import { cvController } from "../controllers/cv.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { CvService } from "../services/cv.service.js";

const svc = new CvService();

export const cvRoutes = new Hono();

cvRoutes.use("*", authMiddleware);
cvRoutes.route("/", cvController);

export const publicCvRoutes = new Hono();

publicCvRoutes.get("/share/:token", async (c) => {
    try {
        const cv = await svc.getPublicCv(c.req.param("token"));
        return c.json({ cv });
    } catch {
        return c.json({ error: "CV not found or not public" }, 404);
    }
});
