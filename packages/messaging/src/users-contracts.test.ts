import assert from "node:assert/strict";
import test from "node:test";
import { isUserProfileUpsertedEvent } from "./users-contracts.js";

test("isUserProfileUpsertedEvent validates event payload", () => {
    const valid = {
        eventId: "evt-1",
        eventName: "users.profile.upserted",
        schemaVersion: 1 as const,
        occurredAtIso: new Date().toISOString(),
        profile: {
            userId: "user-1",
            displayName: "Rayen",
            avatarUrl: "https://example.com/avatar.png",
            isPremium: false,
            roles: ["student"],
        },
    };
    assert.equal(isUserProfileUpsertedEvent(valid), true);
});

test("isUserProfileUpsertedEvent rejects malformed payload", () => {
    const invalid = {
        eventName: "users.profile.upserted",
        schemaVersion: 2,
        profile: { userId: 1 },
    };
    assert.equal(isUserProfileUpsertedEvent(invalid), false);
});
