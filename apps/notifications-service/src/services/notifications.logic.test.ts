import { strict as assert } from "node:assert";
import { test } from "node:test";
import type { ProjectDomainEvent } from "@glybette/messaging";
import { resolveNotificationRecipients } from "./notifications.logic.js";

function makeEvent(
    eventName: ProjectDomainEvent["eventName"],
    payload: Record<string, unknown>,
    actorUserId = "actor-1",
): ProjectDomainEvent {
    return {
        eventId: "evt-1",
        eventName,
        schemaVersion: 1,
        projectId: "project-1",
        actorUserId,
        occurredAtIso: new Date().toISOString(),
        payload,
    };
}

test("join_request_created notifies owner", () => {
    const recipients = resolveNotificationRecipients(
        makeEvent("join_request_created", { ownerId: "owner-1", requesterId: "req-1" }),
        ["owner-1", "member-1"],
    );
    assert.deepEqual(recipients, ["owner-1"]);
});

test("join_request_approved notifies requester", () => {
    const recipients = resolveNotificationRecipients(
        makeEvent("join_request_approved", { ownerId: "owner-1", requesterId: "req-1" }),
        ["owner-1", "req-1"],
    );
    assert.deepEqual(recipients, ["req-1"]);
});

test("project_comment_created notifies members except author and adds parent author", () => {
    const recipients = resolveNotificationRecipients(
        makeEvent("project_comment_created", { authorId: "author-1", parentId: "parent-1" }, "author-1"),
        ["owner-1", "author-1", "member-1"],
        "parent-2",
    );
    assert.deepEqual(recipients.sort(), ["member-1", "owner-1", "parent-2"].sort());
});
