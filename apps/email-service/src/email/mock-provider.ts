import type { EmailProvider, OtpEmailInput } from "./provider.js";

export class MockEmailProvider implements EmailProvider {
    async sendEmailVerificationOtp(input: OtpEmailInput): Promise<void> {
        console.log(
            JSON.stringify({
                event: "otp_email_mocked",
                to: input.to,
                expiresAtIso: input.expiresAtIso,
                otpCode: input.otpCode,
            }),
        );
    }
}
