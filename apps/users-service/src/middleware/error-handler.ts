import type { Context } from "hono";
import {
    apiErrorJson,
    UnauthorizedError,
    BadRequestError,
    NotFoundError,
} from "@glybette/utils";

export function errorHandler(err: unknown, c: Context): Response {
    if (err instanceof UnauthorizedError) {
        return c.json(apiErrorJson("UNAUTHORIZED", err.message), 401);
    }
    if (err instanceof BadRequestError) {
        return c.json(apiErrorJson("BAD_REQUEST", err.message), 400);
    }
    if (err instanceof NotFoundError) {
        return c.json(apiErrorJson("NOT_FOUND", err.message), 404);
    }
    console.error("Unhandled error:", err);
    return c.json(apiErrorJson("INTERNAL_ERROR", "Internal server error"), 500);
}
