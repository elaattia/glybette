import * as jose from "jose";

const DEFAULT_EXPIRY = "1h";

export interface JwtPayload {
    sub: string;
    roles?: string[];
    sessionId?: string;
    iat?: number;
    exp?: number;
}

export interface CreateJwtOptions {
    expiresIn?: string | number;
}

/**
 * Create a signed JWT with HS256.
 * @param payload - Claims to embed (sub required)
 * @param secret - Signing secret (min 32 chars recommended)
 * @param options - Optional expiry (default "1h")
 */
export async function createJwt(payload: JwtPayload, secret: string, options: CreateJwtOptions = {}): Promise<string> {
    const secretKey = new TextEncoder().encode(secret);
    const expiresIn = options.expiresIn ?? DEFAULT_EXPIRY;
    const jwt = await new jose.SignJWT({ ...payload, roles: payload.roles ?? [], sessionId: payload.sessionId })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(payload.sub)
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secretKey);
    return jwt;
}

/**
 * Verify and decode a JWT.
 * @returns Decoded payload
 * @throws Error if token is invalid or expired
 */
export async function verifyJwt(token: string, secret: string): Promise<jose.JWTPayload & JwtPayload> {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload as jose.JWTPayload & JwtPayload;
}
