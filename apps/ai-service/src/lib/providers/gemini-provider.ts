import type { AiProvider, ChatMessage, GenerateOptions } from "../ai-provider.types.js";
import { SYSTEM_DEFAULT } from "../ai-provider.types.js";
import { parseJsonWithRetry } from "../json-utils.js";

type GeminiConfig = {
    apiKey: string;
    model: string;
};

interface GeminiGenerateResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
    error?: { message?: string };
}

export class GeminiProvider implements AiProvider {
    readonly name = "gemini" as const;

    constructor(private readonly config: GeminiConfig) {}

    async ping(): Promise<boolean> {
        try {
            const url = this.endpoint("generateContent");
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: AbortSignal.timeout(5000),
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: "ping" }] }],
                    generationConfig: { maxOutputTokens: 8 },
                }),
            });
            return res.ok;
        } catch {
            return false;
        }
    }

    async generateText(prompt: string, opts: GenerateOptions = {}): Promise<string> {
        return this.chat(
            [
                { role: "system", content: opts.system ?? SYSTEM_DEFAULT },
                { role: "user", content: prompt },
            ],
            opts,
        );
    }

    async generateJson<T>(prompt: string, opts: GenerateOptions = {}): Promise<T> {
        const jsonPrompt = `${prompt}\n\nReturn ONLY valid JSON. No markdown fences, no commentary.`;
        return parseJsonWithRetry<T>(
            async (p) =>
                this.chat(
                    [
                        { role: "system", content: opts.system ?? SYSTEM_DEFAULT },
                        { role: "user", content: p },
                    ],
                    { ...opts, temperature: opts.temperature ?? 0.1 },
                ),
            jsonPrompt,
        );
    }

    async chat(messages: ChatMessage[], opts: GenerateOptions = {}): Promise<string> {
        const systemParts = messages.filter((m) => m.role === "system").map((m) => m.content);
        const systemInstruction =
            systemParts.length > 0 ? { parts: [{ text: systemParts.join("\n\n") }] } : undefined;

        const contents = messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
            }));

        const body: Record<string, unknown> = {
            contents,
            generationConfig: {
                maxOutputTokens: opts.maxTokens ?? 1024,
                temperature: opts.temperature ?? 0.7,
            },
        };

        if (systemInstruction) {
            body.systemInstruction = systemInstruction;
        }

        const res = await fetch(this.endpoint("generateContent"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = (await res.json()) as GeminiGenerateResponse;

        if (!res.ok) {
            throw new Error(`Gemini error (${res.status}): ${data.error?.message ?? res.statusText}`);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) throw new Error("Empty response from Gemini");
        return text;
    }

    private endpoint(action: string): string {
        const model = encodeURIComponent(this.config.model);
        return `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}?key=${encodeURIComponent(this.config.apiKey)}`;
    }
}
