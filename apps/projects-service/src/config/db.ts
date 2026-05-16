import mongoose from "mongoose";
import type { ProjectsServiceEnv } from "./env.js";

export async function connectDb(env: ProjectsServiceEnv): Promise<typeof mongoose> {
    const db = await mongoose.connect(env.MONGODB_URI, {
        dbName: env.PROJECTS_SERVICE_MONGODB_DB_NAME,
    });

    console.log(`Projects service connected to MongoDB database ${env.PROJECTS_SERVICE_MONGODB_DB_NAME}`);

    return db;
}
