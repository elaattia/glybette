export interface OtpEmailContentInput {
    otpCode: string;
    expiresAtIso: string;
}

export interface OtpEmailContent {
    subject: string;
    html: string;
}

export function buildEmailVerificationOtpContent(input: OtpEmailContentInput): OtpEmailContent {
    return {
        subject: "Your Glybette verification code",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
            <h1 style="font-size: 22px;">Verify your Glybette email</h1>
            <p>Use the code below to verify your account:</p>
            <p style="font-size: 32px; letter-spacing: 6px; font-weight: 700;">${input.otpCode}</p>
            <p>This code expires at ${new Date(input.expiresAtIso).toLocaleString()}.</p>
            <p>If you did not request this code, you can ignore this email.</p>
        </div>
    `,
    };
}
