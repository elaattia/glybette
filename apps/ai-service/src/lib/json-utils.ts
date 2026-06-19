export function stripJsonFences(text: string): string {
    return text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .trim();
}

export async function parseJsonWithRetry<T>(
    generate: (prompt: string, jsonMode: boolean) => Promise<string>,
    prompt: string,
): Promise<T> {
    const raw = await generate(prompt, true);
    const cleaned = stripJsonFences(raw);
    try {
        return JSON.parse(cleaned) as T;
    } catch {
        const retryPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON starting with { and ending with }.`;
        const raw2 = await generate(retryPrompt, true);
        const cleaned2 = stripJsonFences(raw2);
        return JSON.parse(cleaned2) as T;
    }
}
