import { BadRequestError } from "@glybette/utils";
import { DiskUploadProvider } from "./disk-provider.js";
import { S3UploadProvider } from "./s3-provider.js";
import type { UploadProvider, UploadProviderConfig } from "./types.js";

export function createUploadProvider(config: UploadProviderConfig): UploadProvider {
    if (config.provider === "disk") {
        if (!config.disk?.rootDir || !config.disk?.publicBaseUrl) {
            throw new BadRequestError("Disk upload provider requires rootDir and publicBaseUrl.");
        }
        return new DiskUploadProvider({
            rootDir: config.disk.rootDir,
            publicBaseUrl: config.disk.publicBaseUrl,
        });
    }

    if (config.provider === "s3") {
        if (!config.s3?.bucket || !config.s3?.region) {
            throw new BadRequestError("S3 upload provider requires bucket and region.");
        }
        return new S3UploadProvider({
            bucket: config.s3.bucket,
            region: config.s3.region,
            prefix: config.s3.prefix,
            endpoint: config.s3.endpoint,
            forcePathStyle: config.s3.forcePathStyle,
            accessKeyId: config.s3.accessKeyId,
            secretAccessKey: config.s3.secretAccessKey,
            publicBaseUrl: config.s3.publicBaseUrl,
        });
    }

    throw new BadRequestError("Unsupported upload provider.");
}
