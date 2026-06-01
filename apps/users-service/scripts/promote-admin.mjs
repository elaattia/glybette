import process from "node:process";
import { MongoClient, ObjectId } from "mongodb";

function parseArg(name) {
    const prefixed = `--${name}=`;
    const match = process.argv.find((arg) => arg.startsWith(prefixed));
    if (!match) return undefined;
    return match.slice(prefixed.length).trim();
}

const email = parseArg("email");
const userId = parseArg("userId");
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.USERS_SERVICE_MONGODB_DB_NAME || "users";

if (!mongoUri) {
    console.error("Missing MONGODB_URI environment variable.");
    process.exit(1);
}

if (!email && !userId) {
    console.error("Usage: node scripts/promote-admin.mjs --email=<email> | --userId=<id>");
    process.exit(1);
}

const client = new MongoClient(mongoUri);

try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    const filter = userId
        ? { _id: new ObjectId(userId) }
        : {
              email: String(email).toLowerCase(),
          };

    const existing = await users.findOne(filter);
    if (!existing) {
        console.error("User not found.");
        process.exit(1);
    }

    await users.updateOne(
        { _id: existing._id },
        {
            $set: {
                isAdmin: true,
                updatedAt: new Date(),
            },
            $setOnInsert: {
                baseRole: "student",
                accountStatus: "active",
            },
        },
    );

    console.log(`Admin access granted to ${existing.email ?? existing._id.toString()}.`);
} catch (error) {
    console.error("Failed to promote user to admin:", error instanceof Error ? error.message : error);
    process.exit(1);
} finally {
    await client.close();
}
