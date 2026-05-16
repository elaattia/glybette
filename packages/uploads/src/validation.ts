import { BadRequestError } from "@glybette/utils";

const IMAGE_MIME_TO_EXT: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
};

const IMAGE_EXT_SET = new Set(["png", "jpg", "jpeg", "webp"]);

export interface ValidatedImageUpload {
    buffer: Buffer;
    mimeType: string;
    extension: string;
    size: number;
}

export interface ValidateImageUploadOptions {
    maxBytes: number;
}

function extensionFromName(name: string): string {
    const segments = name.toLowerCase().split(".");
    return segments.length > 1 ? segments.at(-1) ?? "" : "";
}

export async function validateImageUpload(
    file: File | null | undefined,
    options: ValidateImageUploadOptions,
): Promise<ValidatedImageUpload> {
    if (!file) {
        throw new BadRequestError("Image file is required.");
    }

    if (file.size <= 0) {
        throw new BadRequestError("Image file cannot be empty.");
    }

    if (file.size > options.maxBytes) {
        throw new BadRequestError(`Image exceeds max size of ${Math.floor(options.maxBytes / (1024 * 1024))} MB.`);
    }

    const mimeType = file.type.toLowerCase();
    const extension = extensionFromName(file.name);

    const mimeExt = IMAGE_MIME_TO_EXT[mimeType];
    if (!mimeExt) {
        throw new BadRequestError("Unsupported image type. Only PNG, JPG and WEBP are allowed.");
    }

    if (!IMAGE_EXT_SET.has(extension)) {
        throw new BadRequestError("Unsupported image extension. Only .png, .jpg, .jpeg and .webp are allowed.");
    }

    const normalizedExtension = mimeExt === "jpg" ? "jpg" : mimeExt;
    const buffer = Buffer.from(await file.arrayBuffer());

    return {
        buffer,
        mimeType,
        extension: normalizedExtension,
        size: file.size,
    };
}
