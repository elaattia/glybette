export type UploadProviderKind = "disk" | "s3";

export interface UploadedFileResult {
    fileKey: string;
    publicUrl: string;
    mimeType: string;
    size: number;
}

export interface UploadFilePayload {
    buffer: Buffer;
    mimeType: string;
    extension: string;
    scope: string;
}

export interface UploadProvider {
    upload(payload: UploadFilePayload): Promise<UploadedFileResult>;
    remove(fileKey: string): Promise<void>;
}

export interface UploadProviderConfig {
    provider: UploadProviderKind;
    disk?: {
        rootDir: string;
        publicBaseUrl: string;
    };
    s3?: {
        bucket: string;
        region: string;
        prefix?: string;
        endpoint?: string;
        forcePathStyle?: boolean;
        accessKeyId?: string;
        secretAccessKey?: string;
        publicBaseUrl?: string;
    };
}
