import assert from "node:assert/strict";
import test from "node:test";
import { generateOtpCode, hashOtpCode } from "./otp-utils.js";

test("generateOtpCode returns a 6-digit numeric code", () => {
    const code = generateOtpCode();
    assert.match(code, /^\d{6}$/);
});

test("hashOtpCode is deterministic for same input", () => {
    const first = hashOtpCode("secret", "123456");
    const second = hashOtpCode("secret", "123456");
    assert.equal(first, second);
});

test("hashOtpCode changes when input changes", () => {
    const first = hashOtpCode("secret", "123456");
    const second = hashOtpCode("secret", "654321");
    assert.notEqual(first, second);
});
