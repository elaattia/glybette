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
        assert.equal(normalizePortfolioSlug(" Rayen Portfolio_2026! "), "rayen-portfolio-2026");
    });

    it("rejects reserved slugs", () => {
        assert.throws(() => validatePortfolioSlug("app"), /reserved/);
    });

    it("extracts subdomain slugs", () => {
        assert.equal(extractSlugFromHost("rayen.glybette.com", "glybette.com"), "rayen");
        assert.equal(extractSlugFromHost("glybette.com", "glybette.com"), null);
        assert.equal(extractSlugFromHost("deep.rayen.glybette.com", "glybette.com"), null);
    });

    it("accepts a valid live save payload", () => {
        const payload = validateSavePortfolioRequest({
            slug: "rayen",
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

        assert.equal(payload.slug, "rayen");
        assert.equal(payload.tabs[0]?.blocks[0]?.source?.kind, "manual");
    });
});
