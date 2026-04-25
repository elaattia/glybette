import { betterAuth } from "better-auth";
import mongoose from "mongoose";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import type { UsersServiceEnv } from "./env.js";
import { resolveBetterAuthTrustedOrigins } from "./env.js";

/**
 * Create the better-auth instance. Must be called after connectDb() so that
 * mongoose.connection.getClient() is available.
 */
export function createAuth(env: UsersServiceEnv) {
    const client = mongoose.connection.getClient();
    const db = mongoose.connection.db;

    if (!db) {
        throw new Error("Mongoose database connection is not initialized");
    }

    return betterAuth({
        basePath: "/api/auth",
        baseURL: env.BETTER_AUTH_URL,
        trustedOrigins: resolveBetterAuthTrustedOrigins(env),
        secret: env.BETTER_AUTH_SECRET ?? "better-auth-secret-please-set-BETTER_AUTH_SECRET",
        advanced: {
            cookies: {
                session_token: {
                    attributes: {
                        path: "/",
                    },
                },
                session_data: {
                    attributes: {
                        path: "/",
                    },
                },
            },
        },
        user: {
            modelName: "users",
        },
        session: {
            modelName: "auth_sessions",
        },
        account: {
            modelName: "auth_accounts",
        },
        verification: {
            modelName: "auth_verifications",
        },
        database: mongodbAdapter(db, { client }),
        emailAndPassword: {
            enabled: true,
        },
        socialProviders: {
            ...(env.GOOGLE_CLIENT_ID &&
                env.GOOGLE_CLIENT_SECRET && {
                    google: {
                        clientId: env.GOOGLE_CLIENT_ID,
                        clientSecret: env.GOOGLE_CLIENT_SECRET,
                    },
                }),
            ...(env.GITHUB_CLIENT_ID &&
                env.GITHUB_CLIENT_SECRET && {
                    github: {
                        clientId: env.GITHUB_CLIENT_ID,
                        clientSecret: env.GITHUB_CLIENT_SECRET,
                    },
                }),
            ...(env.LINKEDIN_CLIENT_ID &&
                env.LINKEDIN_CLIENT_SECRET && {
                    linkedin: {
                        clientId: env.LINKEDIN_CLIENT_ID,
                        clientSecret: env.LINKEDIN_CLIENT_SECRET,
                    },
                }),
        },
    });
}

export type AuthInstance = ReturnType<typeof createAuth>;
