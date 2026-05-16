# Inter-Service Communication Standard

This document defines the project-wide standard for microservice interoperability in Glybette.

## Goals

- Use one consistent model for sync and async service communication.
- Remove ad-hoc per-service conventions (timeouts, auth headers, error mapping).
- Keep contracts explicit and versionable from shared packages.

## Communication Lanes

### Lane A: Edge Sync (Client -> API Gateway -> Service)

- Browser/API clients call only the API gateway.
- Gateway proxies to services using declarative routing in `apps/api-gateway/src/config/proxy-routes.ts`.
- Auth context is gateway-injected (`x-user-id`, `x-user-roles`) when `injectGatewayAuth` is enabled.
- Services should return `apiErrorJson`-compatible error payloads.

### Lane B: Internal Sync RPC (Service -> Service HTTP)

- Services calling other services should use a shared internal HTTP utility (not ad-hoc `fetch`).
- Required conventions:
  - explicit timeout per request
  - optional retries only for safe/idempotent operations
  - internal secret header for trusted internal routes
  - stable typed error mapping to domain errors
  - optional `x-correlation-id` propagation for tracing

### Lane C: Async Domain Events (Service -> RabbitMQ -> Consumers)

- Event contracts and routing keys are defined in `packages/messaging`.
- Every event contract includes:
  - `eventId`
  - `eventName`
  - `schemaVersion`
  - `occurredAtIso`
  - domain identifiers (`userId`, `projectId`, etc.)
  - typed `payload`
- Consumers must:
  - validate payload with runtime guards
  - be idempotent
  - send failures to DLQ (`nack(requeue=false)`)

## Naming Conventions

### Exchanges

- Domain-scoped topic exchanges:
  - `glybette.auth.events`
  - `glybette.users.events`
  - `glybette.projects.events`

### Routing keys

- `<domain>.<entity>.<action>` style:
  - `auth.otp.send`
  - `users.profile.upserted`
  - `projects.join_request.created`

### Queues

- Consumer-owned queue naming:
  - `glybette.<consumer-service>.<purpose>`
  - Example: `glybette.projects.user_projection`

### Dead-letter resources

- Queue-specific DLX/DLQ:
  - `<queue>.dlx`
  - `<queue>.dlq`

## Security Baseline

- Internal service routes must validate `x-internal-secret`.
- Avoid hardcoded secret fallbacks in business/service logic.
- Public-facing DTOs must exclude private fields (`email`, provider metadata) unless explicitly needed.

## Reliability Baseline

- Sync calls always use timeout.
- Async consumers are idempotent and replay-safe.
- Event delivery is at-least-once; consumers own dedupe semantics.

## Contract Governance

- Shared contracts first, implementation second.
- Additive evolution by default.
- Breaking event changes require `schemaVersion` bump and dual-read period.

## First Reference Implementation

The first standard-compliant interop rollout is `projects <-> users` profile enrichment:

- `users-service` emits profile events.
- `projects-service` consumes and stores a denormalized user snapshot.
- project responses include optional user summaries while preserving raw IDs.

## TODO: Next Ports To This System

- [ ] **Gateway internals**: replace remaining ad-hoc internal `fetch` calls in `apps/api-gateway/src/auth/require-auth.ts` with the shared internal HTTP utility and consistent timeout/error mapping.
- [ ] **CV -> AI interop hardening**: complete migration of all CV/AI internal calls to the shared utility, add correlation-id propagation, and remove fallback secrets.
- [ ] **Users service internal auth consistency**: align all internal-only routes on one middleware contract for `x-internal-secret` validation.
- [ ] **Portfolio -> Users enrichment**: add optional public user summaries for portfolio-owned resources using the same users snapshot pattern used by projects.
- [ ] **Opportunities/comment identity enrichment**: if/when opportunities become first-class domain records, project the same user summaries for commenters/applicants.
- [ ] **Notifications service onboarding**: consume domain events (`users`, `projects`, future domains) through standardized queue naming + DLQ policy from `packages/messaging`.
- [ ] **Event envelope normalization**: ensure all domain events include `eventId`, `eventName`, `schemaVersion`, `occurredAtIso`, and typed payload guards.
- [ ] **Idempotency persistence standard**: add a reusable dedupe helper for consumers (event-id store) instead of per-service ad-hoc logic.
- [ ] **Observability baseline**: add shared structured logs/metrics for publish, consume, nack, and DLQ counts by routing key.
- [ ] **Interop conformance checks**: add CI checks/tests that flag new ad-hoc service-to-service `fetch` usage outside the shared utility.
