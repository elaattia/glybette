import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    extractSlugFromHost,
    normalizePortfolioSlug,
    validatePortfolioSlug,
    validateSavePortfolioRequest,
} from "./portfolio.validation.js";

describe("portfolio validation", () => {
    it("normalizes portfolio slugs", () => {
        assert.equal(normalizePortfolioSlug(" Ela Portfolio_2026! "), "Ela-portfolio-2026");
    });

    it("rejects reserved slugs", () => {
        assert.throws(() => validatePortfolioSlug("app"), /reserved/);
    });

    it("extracts subdomain slugs", () => {
        assert.equal(extractSlugFromHost("ela.glybette.com", "glybette.com"), "ela");
        assert.equal(extractSlugFromHost("glybette.com", "glybette.com"), null);
        assert.equal(extractSlugFromHost("deep.ela.glybette.com", "glybette.com"), null);
    });

    it("accepts a valid live save payload", () => {
        const payload = validateSavePortfolioRequest({
            slug: "ela",
            templateId: "atelier",
            style: {
                theme: "dark",
                accentColor: "#16A34A",
                fontFamily: "DM Sans",
                radius: "soft",
            },
            tabs: [
                {
                    id: "tab-1",
                    label: "About",
                    slug: "about",
                    blocks: [
                        {
                            id: "block-1",
                            type: "markdown",
                            grid: { column: 1, row: 1, columnSpan: 2, rowSpan: 1 },
                            data: { markdown: "Hello" },
                        },
                    ],
                },
            ],
        });

        assert.equal(payload.slug, "ela");
        assert.equal(payload.tabs[0]?.blocks[0]?.source?.kind, "manual");
    });
});
