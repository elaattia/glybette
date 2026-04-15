/**
 * Extension points for phase-two concerns (metrics, tracing, custom logging sinks).
 * Register from bootstrap if needed; middleware no-ops when unset.
 */
export type GatewayRequestHookContext = {
    requestId: string;
    method: string;
    url: string;
};

export type GatewayResponseHookContext = {
    requestId: string;
    method: string;
    url: string;
    status: number;
    durationMs: number;
};

export type GatewayHooks = {
    onRequest?: (ctx: GatewayRequestHookContext) => void;
    onResponse?: (ctx: GatewayResponseHookContext) => void;
};

let hooks: GatewayHooks = {};

export function registerGatewayHooks(next: GatewayHooks): void {
    hooks = { ...hooks, ...next };
}

export function getGatewayHooks(): GatewayHooks {
    return hooks;
}

export function resetGatewayHooksForTests(): void {
    hooks = {};
}
