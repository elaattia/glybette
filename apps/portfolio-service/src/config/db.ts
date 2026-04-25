import mongoose from "mongoose";
import type { PortfolioServiceEnv } from "./env.js";

export async function connectDb(env: PortfolioServiceEnv): Promise<typeof mongoose> {
    const db = await mongoose.connect(env.MONGODB_URI, {
        dbName: env.PORTFOLIO_SERVICE_MONGODB_DB_NAME,
    });

    console.log(
        `Portfolio service connected to MongoDB database ${env.PORTFOLIO_SERVICE_MONGODB_DB_NAME}`,
    );

    return db;
}
