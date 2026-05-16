#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env");
const args = new Set(process.argv.slice(2));
const includesAi = args.has("--ai");

function parseEnvFile(filePath) {
    const parsed = {};
    if (!fs.existsSync(filePath)) {
        return parsed;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const eqIndex = trimmed.indexOf("=");
        if (eqIndex <= 0) continue;

        const key = trimmed.slice(0, eqIndex).trim();
        let value = trimmed.slice(eqIndex + 1).trim();

        const isWrappedInQuotes =
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"));
        if (isWrappedInQuotes) {
            value = value.slice(1, -1);
        }

        parsed[key] = value;
    }

    return parsed;
}

function readConfig() {
    const fileEnv = parseEnvFile(envPath);
    return {
        ...fileEnv,
        ...process.env,
    };
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function validateMongoUri(value) {
    return (
        isNonEmptyString(value) &&
        (value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"))
    );
}

function fail(message) {
    console.error(`\n[docker-env-check] ${message}\n`);
}

function main() {
    if (!fs.existsSync(envPath)) {
        fail(
            "Missing .env file. Copy .env.docker.dev.example to .env and fill required values before running Docker compose.",
        );
        process.exit(1);
    }

    const env = readConfig();
    const errors = [];
    const warnings = [];

    if (!validateMongoUri(env.MONGODB_URI)) {
        errors.push("MONGODB_URI must be set and start with mongodb:// or mongodb+srv://");
    }

    if (!isNonEmptyString(env.INTERNAL_SERVICE_SECRET)) {
        errors.push("INTERNAL_SERVICE_SECRET is required");
    }

    if (!isNonEmptyString(env.BETTER_AUTH_SECRET) || env.BETTER_AUTH_SECRET.trim().length < 32) {
        errors.push("BETTER_AUTH_SECRET is required and must be at least 32 characters");
    }

    if (env.EMAIL_PROVIDER === "resend" && !isNonEmptyString(env.RESEND_API_KEY)) {
        errors.push("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
    }

    if (includesAi && env.AI_PROVIDER === "anthropic" && !isNonEmptyString(env.ANTHROPIC_API_KEY)) {
        errors.push("ANTHROPIC_API_KEY is required when --ai and AI_PROVIDER=anthropic");
    }

    if (includesAi && env.AI_PROVIDER === "gemini" && !isNonEmptyString(env.GEMINI_API_KEY)) {
        errors.push("GEMINI_API_KEY is required when --ai and AI_PROVIDER=gemini");
    }

    if (includesAi && !isNonEmptyString(env.OLLAMA_BASE_URL)) {
        warnings.push(
            "OLLAMA_BASE_URL is empty. Compose defaults to http://host.docker.internal:11434 for AI profile.",
        );
    }

    if (errors.length > 0) {
        fail("Docker env validation failed:");
        for (const error of errors) {
            console.error(`  - ${error}`);
        }
        process.exit(1);
    }

    if (warnings.length > 0) {
        console.warn("\n[docker-env-check] Warnings:");
        for (const warning of warnings) {
            console.warn(`  - ${warning}`);
        }
    }

    console.log("[docker-env-check] OK");
}

main();
