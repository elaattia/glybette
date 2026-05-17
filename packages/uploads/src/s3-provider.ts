import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { BadRequestError } from "@glybette/utils";
import type { UploadProvider, UploadFilePayload } from "./types.js";

export interface S3UploadProviderOptions {
    bucket: string;
    region: string;
    prefix?: string;
    endpoint?: string;
    forcePathStyle?: boolean;
    accessKeyId?: string;
    secretAccessKey?: string;
    publicBaseUrl?: string;
}

function sanitizeScope(scope: string): string {
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

function buildKey(prefix: string | undefined, scope: string, extension: string) {
    const pieces = [prefix?.replace(/^\/+|\/+$/g, ""), scope, `${randomUUID()}.${extension}`].filter(Boolean);
    return pieces.join("/");
}

function inferPublicUrl(options: S3UploadProviderOptions, key: string): string {
    const explicitBase = options.publicBaseUrl?.trim();
    if (explicitBase) {
        return `${explicitBase.replace(/\/$/, "")}/${key}`;
    }
    if (options.endpoint) {
        return `${options.endpoint.replace(/\/$/, "")}/${options.bucket}/${key}`;
    }
    return `https://${options.bucket}.s3.${options.region}.amazonaws.com/${key}`;
}

export class S3UploadProvider implements UploadProvider {
    private readonly client: S3Client;

    constructor(private readonly options: S3UploadProviderOptions) {
        this.client = new S3Client({
            region: options.region,
            endpoint: options.endpoint,
            forcePathStyle: options.forcePathStyle,
            credentials:
                options.accessKeyId && options.secretAccessKey
                    ? {
                          accessKeyId: options.accessKeyId,
                          secretAccessKey: options.secretAccessKey,
                      }
                    : undefined,
        });
    }

    async upload(payload: UploadFilePayload) {
        const scope = sanitizeScope(payload.scope);
        const key = buildKey(this.options.prefix, scope, payload.extension);

        await this.client.send(
            new PutObjectCommand({
                Bucket: this.options.bucket,
                Key: key,
                Body: payload.buffer,
                ContentType: payload.mimeType,
            }),
        );

        return {
            fileKey: key,
            publicUrl: inferPublicUrl(this.options, key),
            mimeType: payload.mimeType,
            size: payload.buffer.byteLength,
        };
    }

    async remove(fileKey: string): Promise<void> {
        await this.client
            .send(
                new DeleteObjectCommand({
                    Bucket: this.options.bucket,
                    Key: fileKey,
                }),
            )
            .catch(() => {});
    }
}
