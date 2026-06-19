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

export function buildEmailVerificationOtpPlainText(input: OtpEmailContentInput): string {
    return [
        "Verify your Glybette email",
        "",
        "Use the code below to verify your account:",
        "",
        input.otpCode,
        "",
        `This code expires at ${new Date(input.expiresAtIso).toLocaleString()}.`,
        "",
        "If you did not request this code, you can ignore this email.",
    ].join("\n");
}

export function formatOtpEmailLog(input: {
    from: string;
    to: string;
    otpCode: string;
    expiresAtIso: string;
}): string {
    const content = buildEmailVerificationOtpContent({
        otpCode: input.otpCode,
        expiresAtIso: input.expiresAtIso,
    });

    return [
        "",
        "----------",
        `From: ${input.from}`,
        `To: ${input.to}`,
        `Subject: ${content.subject}`,
        `Date: ${new Date().toUTCString()}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
        "",
        buildEmailVerificationOtpPlainText({
            otpCode: input.otpCode,
            expiresAtIso: input.expiresAtIso,
        }),
        "",
    ].join("\n");
}
