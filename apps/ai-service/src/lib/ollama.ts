const BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL ?? "mistral";

const SYSTEM_DEFAULT =
    "You are an expert CV/resume writer and career coach. " +
    "Always respond in the same language as the CV content provided.";

interface OllamaGenerateResponse {
    model: string;
    response: string;
    done: boolean;
}

interface OllamaChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface OllamaChatResponse {
    model: string;
    message: OllamaChatMessage;
    done: boolean;
}

export async function callOllama(
    prompt: string,
    opts: {
        system?: string;
        maxTokens?: number;
        format?: "json";
        temperature?: number;
    } = {},
): Promise<string> {
    const system = opts.system ?? SYSTEM_DEFAULT;
    const numPredict = opts.maxTokens ?? 1024;
    const temperature = opts.temperature ?? 0.7;

    const messages: OllamaChatMessage[] = [
        { role: "system", content: system },
        { role: "user", content: prompt },
    ];

    const body: any = {
        model: MODEL,
        messages,
        stream: false,
        options: {
            num_predict: numPredict,
            temperature: temperature,
            top_p: 0.9,
        },
    };

    if (opts.format === "json") {
        body.format = "json";
    }

    const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

export async function callOllamaJson<T>(prompt: string, opts: Parameters<typeof callOllama>[1] = {}): Promise<T> {
    const strictJsonOpts = {
        ...opts,
        format: "json" as const,
        temperature: opts.temperature ?? 0.1,
    };

    const raw = await callOllama(prompt, strictJsonOpts);
    const cleaned = stripJsonFences(raw);
    try {
        return JSON.parse(cleaned) as T;
    } catch {
        const retryPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON starting with { and ending with }.`;
        const raw2 = await callOllama(retryPrompt, strictJsonOpts);
        const cleaned2 = stripJsonFences(raw2);
        return JSON.parse(cleaned2) as T;
    }
}

function stripJsonFences(text: string): string {
    return text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .trim();
}

export async function pingOllama(): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
        return res.ok;
    } catch {
        return false;
    }
}
