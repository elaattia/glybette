import { Resend } from "resend";
import { buildEmailVerificationOtpContent } from "@glybette/messaging";
import type { EmailProvider, OtpEmailInput } from "./provider.js";

export class ResendEmailProvider implements EmailProvider {
    private client: Resend;

    constructor(
        private readonly apiKey: string,
        private readonly fromAddress: string,
    ) {
        this.client = new Resend(apiKey);
    }

    async sendEmailVerificationOtp(input: OtpEmailInput): Promise<void> {
        const content = buildEmailVerificationOtpContent({
            otpCode: input.otpCode,
            expiresAtIso: input.expiresAtIso,
        });

        const result = await this.client.emails.send({
            from: this.fromAddress,
            to: input.to,
            subject: content.subject,
            html: content.html,
        });

        if (result.error) {
            throw new Error(`Resend delivery failed: ${result.error.message}`);
        }
    }
}
