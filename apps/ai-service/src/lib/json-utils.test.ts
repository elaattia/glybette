import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { stripJsonFences } from "./json-utils.js";
import { createAiProvider } from "./create-ai-provider.js";
import type { AiServiceEnv } from "../config/env.js";

describe("stripJsonFences", () => {
    it("removes markdown json fences", () => {
        assert.equal(stripJsonFences("```json\n{\"a\":1}\n```"), '{"a":1}');
    });
});

describe("createAiProvider", () => {
    it("creates ollama provider", () => {
        const env = {
            NODE_ENV: "development",
            PORT_AI_SERVICE: 3007,
            INTERNAL_SERVICE_SECRET: "secret",
            AI_PROVIDER: "ollama",
            OLLAMA_BASE_URL: "http://localhost:11434",
            OLLAMA_MODEL: "mistral",
            GEMINI_MODEL: "gemini-2.0-flash",
        } as AiServiceEnv;

        const provider = createAiProvider(env);
        assert.equal(provider.name, "ollama");
    });

    it("creates gemini provider when key is present", () => {
        const env = {
            NODE_ENV: "production",
            PORT_AI_SERVICE: 3007,
            INTERNAL_SERVICE_SECRET: "secret",
            AI_PROVIDER: "gemini",
            OLLAMA_BASE_URL: "http://localhost:11434",
            OLLAMA_MODEL: "mistral",
            GEMINI_MODEL: "gemini-2.0-flash",
            GEMINI_API_KEY: "test-key",
        } as AiServiceEnv;

        const provider = createAiProvider(env);
        assert.equal(provider.name, "gemini");
    });

    it("throws for anthropic provider", () => {
        const env = {
            NODE_ENV: "production",
            PORT_AI_SERVICE: 3007,
            INTERNAL_SERVICE_SECRET: "secret",
            AI_PROVIDER: "anthropic",
            OLLAMA_BASE_URL: "http://localhost:11434",
            OLLAMA_MODEL: "mistral",
            GEMINI_MODEL: "gemini-2.0-flash",
        } as AiServiceEnv;

        assert.throws(() => createAiProvider(env), /anthropic is not implemented/i);
    });
});
