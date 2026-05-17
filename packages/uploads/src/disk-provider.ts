import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { randomUUID } from "node:crypto";
import { BadRequestError } from "@glybette/utils";
import type { UploadProvider, UploadFilePayload } from "./types.js";

export interface DiskUploadProviderOptions {
    rootDir: string;
    publicBaseUrl: string;
}

function normalizeFileKey(value: string): string {
    return value.replaceAll("\\", "/").replace(/^\/+/, "");
}

function validateScope(scope: string): string {
    const normalized = scope
        .trim()
        .replaceAll("\\", "/")
        .replace(/\/+/g, "/")
        .replace(/^\/+|\/+$/g, "");
    if (!normalized || normalized.includes("..")) {
        throw new BadRequestError("Invalid upload scope.");
    }
    return normalized;
}

function resolveTargetPath(rootDir: string, fileKey: string): string {
    const normalizedRoot = normalize(rootDir);
    const candidatePath = normalize(join(normalizedRoot, fileKey));
    if (!candidatePath.startsWith(normalizedRoot)) {
        throw new BadRequestError("Unsafe upload path.");
    }
    return candidatePath;
}

export class DiskUploadProvider implements UploadProvider {
    constructor(private readonly options: DiskUploadProviderOptions) {}

    async upload(payload: UploadFilePayload) {
        const safeScope = validateScope(payload.scope);
        const fileName = `${randomUUID()}.${payload.extension}`;
        const fileKey = normalizeFileKey(`${safeScope}/${fileName}`);
        const absolutePath = resolveTargetPath(this.options.rootDir, fileKey);

        await mkdir(dirname(absolutePath), { recursive: true });
        await writeFile(absolutePath, payload.buffer);

        const publicBaseUrl = this.options.publicBaseUrl.replace(/\/$/, "");

        return {
            fileKey,
            publicUrl: `${publicBaseUrl}/${fileKey}`,
            mimeType: payload.mimeType,
            size: payload.buffer.byteLength,
        };
    }

    async remove(fileKey: string): Promise<void> {
        const absolutePath = resolveTargetPath(this.options.rootDir, normalizeFileKey(fileKey));
        await unlink(absolutePath).catch(() => {});
    }
}
