import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deleteUserRequestIncludesPasswordProof } from "./delete-user-policy.js";

describe("deleteUserRequestIncludesPasswordProof", () => {
    it("treats GET requests as already verified", async () => {
        assert.equal(
            await deleteUserRequestIncludesPasswordProof(
                new Request("http://localhost/delete-user/callback?token=abc", { method: "GET" }),
            ),
            true,
        );
    });

    it("detects password proof on POST requests", async () => {
        assert.equal(
            await deleteUserRequestIncludesPasswordProof(
                new Request("http://localhost/api/auth/delete-user", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ password: "secret" }),
                }),
            ),
            true,
        );
    });

    it("detects verification token proof on POST requests", async () => {
        assert.equal(
            await deleteUserRequestIncludesPasswordProof(
                new Request("http://localhost/api/auth/delete-user", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ token: "verify-token" }),
                }),
            ),
            true,
        );
    });

    it("returns false when POST body has no password proof", async () => {
        assert.equal(
            await deleteUserRequestIncludesPasswordProof(
                new Request("http://localhost/api/auth/delete-user", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({}),
                }),
            ),
            false,
        );
    });
});
