import assert from "node:assert/strict";
import test from "node:test";
import { isProjectDomainEvent } from "./projects-contracts.js";

test("isProjectDomainEvent validates project event payload", () => {
    const valid = {
        eventId: "evt-1",
        eventName: "join_request_created",
        schemaVersion: 1,
        projectId: "project-1",
        actorUserId: "user-1",
        occurredAtIso: new Date().toISOString(),
        payload: { requestId: "req-1" },
    };

    assert.equal(isProjectDomainEvent(valid), true);
});

test("isProjectDomainEvent rejects malformed payload", () => {
    const invalid = {
        eventName: "invalid_name",
        projectId: 123,
    };

    assert.equal(isProjectDomainEvent(invalid), false);
});
