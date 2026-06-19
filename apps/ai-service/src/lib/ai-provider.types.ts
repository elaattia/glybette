export type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};

export type GenerateOptions = {
    system?: string;
    maxTokens?: number;
    temperature?: number;
};

export type AiProviderName = "ollama" | "gemini";

export interface AiProvider {
    readonly name: AiProviderName;
    generateText(prompt: string, opts?: GenerateOptions): Promise<string>;
    generateJson<T>(prompt: string, opts?: GenerateOptions): Promise<T>;
    chat(messages: ChatMessage[], opts?: GenerateOptions): Promise<string>;
    ping(): Promise<boolean>;
}

export const SYSTEM_DEFAULT =
    "You are an expert CV/resume writer and career coach. " +
    "Always respond in the same language as the CV content provided.";
