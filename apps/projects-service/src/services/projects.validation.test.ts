import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    validateCreateCommentPayload,
    validateCreateProjectPayload,
    validateListProjectsQuery,
    validateObjectIdParam,
} from "./projects.validation.js";

describe("projects validation", () => {
    it("accepts valid create project payload", () => {
        const payload = validateCreateProjectPayload({
            title: "AI Portfolio Optimizer",
            shortDescription: "Collaborative toolkit to optimize student portfolios.",
            description: "Build an AI-assisted workflow that scores portfolios and proposes better narrative structure.",
            domain: "Software / IT",
            difficulty: "intermediate",
            technologies: ["React", "TypeScript", "OpenAI"],
            teamSizeTarget: 3,
            engagement: {
                hoursPerWeek: 10,
                workMode: "async",
            },
            openRoles: [
                {
                    title: "Frontend Developer",
                    quantity: 1,
                    skills: ["React", "Tailwind CSS"],
                },
            ],
            milestones: [
                {
                    title: "MVP",
                    description: "Ship project listing and comment loop.",
                    status: "todo",
                },
            ],
            publish: true,
        });

        assert.equal(payload.publish, true);
        assert.equal(payload.openRoles[0]?.title, "Frontend Developer");
    });

    it("rejects invalid project payload", () => {
        assert.throws(
            () =>
                validateCreateProjectPayload({
                    title: "x",
                    shortDescription: "tiny",
                    description: "tiny",
                    domain: "",
                    difficulty: "intermediate",
                    technologies: [],
                    teamSizeTarget: 0,
                    engagement: { hoursPerWeek: 0, workMode: "async" },
                    openRoles: [],
                    milestones: [],
                }),
            /Invalid|at least|must/i,
        );
    });

    it("validates list query defaults", () => {
        const query = validateListProjectsQuery({});
        assert.equal(query.page, 1);
        assert.equal(query.pageSize, 12);
    });

    it("accepts comment payload and object id param", () => {
        const comment = validateCreateCommentPayload({ content: "Looks promising!" });
        assert.equal(comment.content, "Looks promising!");
        assert.equal(validateObjectIdParam("6650f84a26e4b7f94e501122"), "6650f84a26e4b7f94e501122");
    });
});
