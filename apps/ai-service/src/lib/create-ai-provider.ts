import type { AiServiceEnv } from "../config/env.js";
import type { AiProvider } from "./ai-provider.types.js";
import { GeminiProvider } from "./providers/gemini-provider.js";
import { OllamaProvider } from "./providers/ollama-provider.js";

export function createAiProvider(env: AiServiceEnv): AiProvider {
    switch (env.AI_PROVIDER) {
        case "ollama":
            return new OllamaProvider({
                baseUrl: env.OLLAMA_BASE_URL,
                model: env.OLLAMA_MODEL,
                cfAccessClientId: env.OLLAMA_CF_ACCESS_CLIENT_ID,
                cfAccessClientSecret: env.OLLAMA_CF_ACCESS_CLIENT_SECRET,
            });
        case "gemini":
            return new GeminiProvider({
                apiKey: env.GEMINI_API_KEY!,
                model: env.GEMINI_MODEL,
            });
        case "anthropic":
            throw new Error(
                "AI_PROVIDER=anthropic is not implemented yet. Use gemini for production or ollama for local dev.",
            );
        default: {
            const _exhaustive: never = env.AI_PROVIDER;
            throw new Error(`Unsupported AI provider: ${_exhaustive}`);
        }
    }
}
