import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateImageUpload } from "./validation.js";

describe("uploads validation", () => {
    it("accepts valid png image upload", async () => {
        const file = new File([Buffer.from("png-bytes")], "cover.png", { type: "image/png" });
        const result = await validateImageUpload(file, { maxBytes: 5 * 1024 * 1024 });
        assert.equal(result.extension, "png");
        assert.equal(result.mimeType, "image/png");
        assert.equal(result.size, file.size);
    });

    it("rejects unsupported image type", async () => {
        const file = new File([Buffer.from("gif-bytes")], "cover.gif", { type: "image/gif" });
        await assert.rejects(
            async () => validateImageUpload(file, { maxBytes: 5 * 1024 * 1024 }),
            /Unsupported image type/,
        );
    });

    it("rejects oversized image", async () => {
        const maxBytes = 1024;
        const file = new File([Buffer.alloc(maxBytes + 1)], "cover.jpg", { type: "image/jpeg" });
        await assert.rejects(async () => validateImageUpload(file, { maxBytes }), /exceeds max size/);
    });
});
