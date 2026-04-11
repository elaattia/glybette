import mongoose from "mongoose";
import type { UsersServiceEnv } from "./env.js";

export async function connectDb(env: UsersServiceEnv): Promise<void> {
    if (!env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required for users-service");
    }
    await mongoose.connect(env.MONGODB_URI, {
        dbName: env.USERS_SERVICE_MONGODB_DB_NAME,
    });
}

export async function disconnectDb(): Promise<void> {
    await mongoose.disconnect();
}
