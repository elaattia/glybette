import mongoose from "mongoose";
import type { NotificationsServiceEnv } from "./env.js";

export async function connectDb(env: NotificationsServiceEnv): Promise<typeof mongoose> {
    const db = await mongoose.connect(env.MONGODB_URI, {
        dbName: env.NOTIFICATIONS_SERVICE_MONGODB_DB_NAME,
    });

    console.log(`Notifications service connected to MongoDB database ${env.NOTIFICATIONS_SERVICE_MONGODB_DB_NAME}`);

    return db;
}
