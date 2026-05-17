import mongoose from "mongoose";

export async function connectDb() {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/glybette-jobs";
    await mongoose.connect(uri);
    console.log("[jobs-service] MongoDB connected");
}