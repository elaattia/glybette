import mongoose from "mongoose";

type DeleteUserRequestBody = {
    password?: string;
    token?: string;
};

export async function deleteUserRequestIncludesPasswordProof(request: Request | undefined): Promise<boolean> {
    if (!request || request.method === "GET") {
        return true;
    }

    try {
        const body = (await request.clone().json()) as DeleteUserRequestBody;
        return Boolean(body?.password || body?.token);
    } catch {
        return false;
    }
}

export async function userHasCredentialPassword(userId: string): Promise<boolean> {
    const db = mongoose.connection.db;
    if (!db) {
        return false;
    }

    const credentialAccount = await db.collection("auth_accounts").findOne({
        userId,
        providerId: "credential",
        password: { $exists: true, $ne: null },
    });

    return credentialAccount !== null;
}

/**
 * Better Auth allows passwordless deletion when the session is still "fresh".
 * Require a verified password for accounts that have credential login enabled.
 */
export async function assertPasswordProvidedForCredentialAccounts(
    userId: string,
    request: Request | undefined,
): Promise<void> {
    if (await deleteUserRequestIncludesPasswordProof(request)) {
        return;
    }

    if (await userHasCredentialPassword(userId)) {
        throw new Error("PASSWORD_REQUIRED_FOR_DELETE");
    }
}
