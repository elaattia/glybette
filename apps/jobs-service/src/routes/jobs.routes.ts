import { Hono } from "hono";
import { jobsAdminController, jobsController, jobsEnterpriseController, applicationController } from "../controllers/jobs.controller.js";
import { matchingController } from "../controllers/matching.controller.js";
import { interviewController } from "../controllers/interview.controller.js";
import { coverLetterController } from "../controllers/cover-letter.controller.js";
import { chatController } from "../controllers/chat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const publicRoutes = new Hono();
publicRoutes.route("/", jobsController);

export const protectedRoutes = new Hono();
protectedRoutes.use("*", authMiddleware);
protectedRoutes.route("/matching", matchingController);
protectedRoutes.route("/", jobsAdminController);
protectedRoutes.route("/enterprise/offres", jobsEnterpriseController);
protectedRoutes.route("/applications", applicationController);
protectedRoutes.route("/interview", interviewController);
protectedRoutes.route("/cover-letter", coverLetterController);
protectedRoutes.route("/", chatController);