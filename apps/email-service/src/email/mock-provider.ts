import { appendFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatOtpEmailLog } from "@glybette/messaging";
import type { EmailProvider, OtpEmailInput } from "./provider.js";

const defaultLogPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../logs.txt");

export class MockEmailProvider implements EmailProvider {
    constructor(
        private readonly fromAddress: string,
        private readonly logFilePath: string = defaultLogPath,
    ) {}

    async sendEmailVerificationOtp(input: OtpEmailInput): Promise<void> {
        console.log(
            JSON.stringify({
                event: "otp_email_mocked",
                to: input.to,
                expiresAtIso: input.expiresAtIso,
                otpCode: input.otpCode,
            }),
        );

        const logEntry = formatOtpEmailLog({
            from: this.fromAddress,
            to: input.to,
            otpCode: input.otpCode,
            expiresAtIso: input.expiresAtIso,
        });

        try {
            await appendFile(this.logFilePath, logEntry, "utf8");
        } catch (error) {
            console.error(
                JSON.stringify({
                    event: "otp_email_mock_log_failed",
                    logFilePath: this.logFilePath,
                    message: error instanceof Error ? error.message : "Unknown error",
                }),
            );
        }
    }
}
