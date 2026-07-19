import type { AiProvider, ChatMessage, GenerateOptions } from "../ai-provider.types.js";
import { SYSTEM_DEFAULT } from "../ai-provider.types.js";
import { parseJsonWithRetry } from "../json-utils.js";

type OllamaConfig = {
    baseUrl: string;
    model: string;
    //pour cloudflare access mais pour le moment je ne l'utilise pas
    cfAccessClientId?: string;
    cfAccessClientSecret?: string;
};

function buildOllamaHeaders(config: OllamaConfig, extra?: HeadersInit): Headers {
    const headers = new Headers(extra);
    if (config.cfAccessClientId?.trim()) {
        headers.set("CF-Access-Client-Id", config.cfAccessClientId.trim());
    }
    if (config.cfAccessClientSecret?.trim()) {
        headers.set("CF-Access-Client-Secret", config.cfAccessClientSecret.trim());
    }
    return headers;
}

interface OllamaChatResponse {
    message?: { content?: string };
}

export class OllamaProvider implements AiProvider {
    readonly name = "ollama" as const;

    constructor(private readonly config: OllamaConfig) {}

    async ping(): Promise<boolean> {
        try {
            const res = await fetch(`${this.config.baseUrl}/api/tags`, {
                headers: buildOllamaHeaders(this.config),
                signal: AbortSignal.timeout(3000),
            });
            return res.ok;
        } catch {
            return false;
        }
    }

    async generateText(prompt: string, opts: GenerateOptions = {}): Promise<string> {
        const text = await this.chat(
            [
                { role: "system", content: opts.system ?? SYSTEM_DEFAULT },
                { role: "user", content: prompt },
            ],
            opts,
        );
        return text;
    }

    async generateJson<T>(prompt: string, opts: GenerateOptions = {}): Promise<T> {
        return parseJsonWithRetry<T>(
            async (p, jsonMode) =>
                this.chat(
                    [
                        { role: "system", content: opts.system ?? SYSTEM_DEFAULT },
                        { role: "user", content: p },
                    ],
                    { ...opts, temperature: opts.temperature ?? 0.1, jsonMode },
                ),
            prompt,
        );
    }

    async chat(messages: ChatMessage[], opts: GenerateOptions & { jsonMode?: boolean } = {}): Promise<string> {
        const numPredict = opts.maxTokens ?? 1024;
        const temperature = opts.temperature ?? 0.7;

        const body: Record<string, unknown> = {
            model: this.config.model,
            messages,
            stream: false,
            think: false,
            options: {
                num_predict: numPredict,
                temperature,
                top_p: 0.9,
            },
        };

        if (opts.jsonMode) {
            body.format = "json";
        }

        const res = await fetch(`${this.config.baseUrl}/api/chat`, {
            method: "POST",
            headers: buildOllamaHeaders(this.config, { "Content-Type": "application/json" }),
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Ollama error (${res.status}): ${err}`);
        }

        const data = (await res.json()) as OllamaChatResponse;
        const text = data.message?.content?.trim();
        if (!text) throw new Error("Empty response from Ollama");
        return text;
    }
}
