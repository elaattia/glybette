import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toPublicUserSummary } from "./user.service.js";

describe("user service mappers", () => {
    it("maps user dto to public summary", () => {
        const summary = toPublicUserSummary({
            id: "user-1",
            email: "user@example.com",
            emailVerified: true,
            displayName: "Rayen",
            avatarUrl: "https://example.com/avatar.png",
            isPremium: true,
            baseRole: "student",
            isAdmin: false,
            accountStatus: "active",
            roles: ["student"],
            provider: "google",
        });

        assert.deepEqual(summary, {
            id: "user-1",
            displayName: "Rayen",
            avatarUrl: "https://example.com/avatar.png",
            isPremium: true,
            baseRole: "student",
            isAdmin: false,
            accountStatus: "active",
            roles: ["student"],
        });
    });
});
