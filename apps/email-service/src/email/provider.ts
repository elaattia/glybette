export interface OtpEmailInput {
    to: string;
    otpCode: string;
    expiresAtIso: string;
}

export interface EmailProvider {
    sendEmailVerificationOtp(input: OtpEmailInput): Promise<void>;
}
