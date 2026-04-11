import mongoose from "mongoose";
import { AUTH_PROVIDERS, type AuthProvider, type UserDTO } from "@glybette/contracts";
import { NotFoundError } from "@glybette/utils";

type BetterAuthUserDocument = mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    email?: string;
    name?: string;
    image?: string;
};

type BetterAuthAccountDocument = {
    userId: string;
    providerId?: string;
};

function isAuthProvider(value: string | undefined): value is AuthProvider {
    return Boolean(value && AUTH_PROVIDERS.includes(value as AuthProvider));
}

export function toUserDTO(
    user: BetterAuthUserDocument,
    account: BetterAuthAccountDocument | null,
): UserDTO {
    return {
        id: user._id.toString(),
        email: user.email,
        displayName: user.name ?? "User",
        avatarUrl: user.image,
        roles: ["user"],
        provider: isAuthProvider(account?.providerId) ? account.providerId : "google",
    };
}

export class UserService {
    async getById(userId: string): Promise<UserDTO> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Mongoose database connection is not initialized");
        }

        console.log("getting user from database", userId);

        const user = await db.collection<BetterAuthUserDocument>("users").findOne({ _id: new mongoose.Types.ObjectId(userId) });
        if (!user) {
            console.log("user not found", userId);
            throw new NotFoundError("User not found");
        }

        const account = await db
            .collection<BetterAuthAccountDocument>("auth_accounts")
            .findOne({ userId }, { sort: { createdAt: 1 } });

        return toUserDTO(user, account);
    }
}
