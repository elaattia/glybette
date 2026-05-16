import assert from "node:assert/strict";
import { mkdtemp, access, rm } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import { DiskUploadProvider } from "./disk-provider.js";

describe("disk upload provider", () => {
    it("writes and removes uploaded file", async () => {
        const rootDir = await mkdtemp(join(tmpdir(), "glybette-uploads-"));
        const provider = new DiskUploadProvider({
            rootDir,
            publicBaseUrl: "/api/projects/media",
        });

        try {
            const result = await provider.upload({
                buffer: Buffer.from("hello"),
                extension: "png",
                mimeType: "image/png",
                scope: "projects/project-1",
            });

            assert.match(result.fileKey, /^projects\/project-1\/.+\.png$/);
            assert.equal(result.publicUrl.startsWith("/api/projects/media/projects/project-1/"), true);

            await access(join(rootDir, result.fileKey), constants.F_OK);
            await provider.remove(result.fileKey);
            await assert.rejects(async () => access(join(rootDir, result.fileKey), constants.F_OK));
        } finally {
            await rm(rootDir, { recursive: true, force: true });
        }
    });
});
