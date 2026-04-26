import assert from "node:assert/strict";
import test from "node:test";
import { OTP_PURPOSE_EMAIL_VERIFICATION, isOtpEmailRequestedEvent } from "./contracts.js";

test("isOtpEmailRequestedEvent validates correct event payload", () => {
    const valid = {
        eventId: "evt-1",
        correlationId: "corr-1",
        userId: "user-1",
        email: "test@example.com",
        otpCode: "123456",
        purpose: OTP_PURPOSE_EMAIL_VERIFICATION,
        expiresAtIso: new Date().toISOString(),
        requestedAtIso: new Date().toISOString(),
    };
    assert.equal(isOtpEmailRequestedEvent(valid), true);
});

test("isOtpEmailRequestedEvent rejects malformed payload", () => {
    const invalid = {
        userId: "user-1",
        email: "test@example.com",
        otpCode: "123456",
        purpose: "something_else",
    };
    assert.equal(isOtpEmailRequestedEvent(invalid), false);
});
