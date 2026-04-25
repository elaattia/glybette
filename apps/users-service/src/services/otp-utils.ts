import { createHash, randomInt } from "node:crypto";

export function generateOtpCode(): string {
    return `${randomInt(0, 1_000_000)}`.padStart(6, "0");
}

export function hashOtpCode(secret: string, code: string): string {
    return createHash("sha256").update(`${secret}:${code}`).digest("hex");
}
