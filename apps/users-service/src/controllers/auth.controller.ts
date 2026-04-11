import type { Context } from "hono";
import type { AuthInstance } from "../config/auth.js";

export class AuthController {
    constructor(private auth: AuthInstance) {}

    /** Handle all better-auth routes (signin, callback, sign-out). */
    async handleBetterAuth(c: Context): Promise<Response> {
        return this.auth.handler(c.req.raw);
    }
}
