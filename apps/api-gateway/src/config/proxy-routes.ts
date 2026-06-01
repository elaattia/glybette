import type { ServiceRegistry } from "./services.js";

export type ProxyServiceKey = keyof ServiceRegistry;

export type SessionMode = "none" | "optional";

export type UpstreamSpec =
    | {
          kind: "rewrite";
          /** Prepended to the path after `publicPrefix` is stripped (e.g. `/users`). */
          upstreamPrefix: string;
          /** Full public pathname prefix to strip (default: `/api` + `mount`). */
          publicPrefix?: string;
      }
    | { kind: "requestPath" };

export type MethodsSpec = "all" | readonly string[];

export interface GatewayProxyRoute {
    /** Stable id for logs and documentation. */
    name: string;
    /** Key in `ServiceRegistry` — resolves upstream `baseUrl`. */
    service: ProxyServiceKey;
    /** Mount under `/api` (e.g. `/users` → `/api/users/*`). */
    mount: `/${string}`;
    upstream: UpstreamSpec;
    session: SessionMode;
    injectGatewayAuth: boolean;
    requiredAdmin?: boolean;
    allowedBaseRoles?: readonly ("student" | "enterprise")[];
    /** `"all"` uses a catch-all sub-app; otherwise `api.on(methods, mount/*, ...)`. */
    methods: MethodsSpec;
}

/**
 * Declarative upstream proxies. Add entries here when exposing new service prefixes.
 */
export const gatewayProxyRoutes: readonly GatewayProxyRoute[] = [
    {
        name: "users",
        service: "users",
        mount: "/users",
        upstream: { kind: "rewrite", upstreamPrefix: "/users" },
        session: "optional",
        injectGatewayAuth: true,
        allowedBaseRoles: ["student", "enterprise"],
        methods: "all",
    },
    {
        name: "auth_otp",
        service: "users",
        mount: "/auth/otp",
        upstream: { kind: "rewrite", upstreamPrefix: "/auth/otp" },
        session: "optional",
        injectGatewayAuth: true,
        methods: ["POST"],
    },
    {
        name: "auth_verification_status",
        service: "users",
        mount: "/auth/verification-status",
        upstream: { kind: "rewrite", upstreamPrefix: "/auth/verification-status" },
        session: "optional",
        injectGatewayAuth: true,
        methods: ["GET"],
    },
    {
        name: "better_auth",
        service: "users",
        mount: "/auth",
        upstream: { kind: "requestPath" },
        session: "none",
        injectGatewayAuth: false,
        methods: ["GET", "POST"],
    },
    {
        name: "scraping",
        service: "scraping",
        mount: "/scraping",
        upstream: { kind: "rewrite", upstreamPrefix: "" },
        session: "optional",
        injectGatewayAuth: true,
        allowedBaseRoles: ["student"],
        methods: "all",
    },
    {
        name: "cvs",
        service: "cv",
        mount: "/cvs",
        upstream: { kind: "rewrite", upstreamPrefix: "/api/cvs" },
        session: "optional",
        injectGatewayAuth: true,
        allowedBaseRoles: ["student"],
        methods: "all",
    },
    {
        name: "portfolio",
        service: "portfolio",
        mount: "/portfolio",
        upstream: { kind: "rewrite", upstreamPrefix: "/portfolio" },
        session: "optional",
        injectGatewayAuth: true,
        allowedBaseRoles: ["student"],
        methods: "all",
    },
    {
        name: "projects",
        service: "projects",
        mount: "/projects",
        upstream: { kind: "rewrite", upstreamPrefix: "/projects" },
        session: "optional",
        injectGatewayAuth: true,
        allowedBaseRoles: ["student"],
        methods: "all",
    },
    {
        name: "jobs",
        service: "jobs",
        mount: "/jobs",
        upstream: { kind: "rewrite", upstreamPrefix: "/api" },
        session: "optional",
        injectGatewayAuth: true,
        allowedBaseRoles: ["student"],
        methods: "all",
    },
];
