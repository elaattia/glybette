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
        methods: "all",
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
        session: "none",
        injectGatewayAuth: false,
        methods: "all",
    },
];
