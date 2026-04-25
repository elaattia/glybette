export const OTP_PURPOSE_EMAIL_VERIFICATION = "email_verification" as const;

export type OtpPurpose = typeof OTP_PURPOSE_EMAIL_VERIFICATION;

export interface OtpEmailRequestedEvent {
    eventId: string;
    correlationId: string;
    userId: string;
    email: string;
    otpCode: string;
    purpose: OtpPurpose;
    expiresAtIso: string;
    requestedAtIso: string;
}

export function isOtpEmailRequestedEvent(value: unknown): value is OtpEmailRequestedEvent {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Partial<OtpEmailRequestedEvent>;
    return (
        typeof candidate.eventId === "string" &&
        typeof candidate.correlationId === "string" &&
        typeof candidate.userId === "string" &&
        typeof candidate.email === "string" &&
        typeof candidate.otpCode === "string" &&
        candidate.purpose === OTP_PURPOSE_EMAIL_VERIFICATION &&
        typeof candidate.expiresAtIso === "string" &&
        typeof candidate.requestedAtIso === "string"
    );
}
