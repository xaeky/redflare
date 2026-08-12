# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Redflare is a Nuxt 4 / TypeScript web app for avatar artists to manage commissions, billing, and file attachments — a Trello/Notion-style commission organizer. Stack: Nuxt 4, MongoDB (native driver, no ODM), Discord OAuth (customer auth), S3-compatible storage, Bun runtime, Nitro `bun` preset.

## Prohibitions

- Agent shall NOT run destructive scripts (migrations, rollbacks, etc.) on production unless explicitly instructed by an engineer. Commands included: `bun run migrate`, `bun run scripts/rollback.ts <count>`, `bun run util:db`.
- Agent shall NOT run `bun dev` or `bun test` scripts.
- Agent shall NOT inspect `node_modules` or any other dependencies unless explicitly instructed by an engineer.
- Agent shall NOT inspect `.nuxt`, `.data` or `.output` directories unless explicitly instructed by an engineer.

## Commands

Package manager is **bun**, not npm/pnpm/yarn. Documentation and guides: https://bun.com/docs/guides

Local infra (Mongo + rustfs S3-compatible storage) via `docker-compose.dev.yml`:
```bash
docker compose -f docker-compose.dev.yml up -d
```

You may want to setup Infisical too
```bash
cd services/infisical
cp .env.example .env # Dont forget to fill in the values in .env
docker compose up -d
```

## Architecture

### Two separate user/session systems

Redflare has two distinct kinds of users that must not be conflated:

- **Agent users** (artists/managers) — authenticated via a custom native session system, session managed by `nuxt-auth-utils`' built-in `useUserSession`/`getUserSession`. Logic lives in `server/utils/agentSession.ts`.
- **Public users** (customers) — authenticated via Discord OAuth, session is a *separate* custom cookie-backed session implemented from scratch in `server/utils/publicSession.ts` (`getPublicUserSession`/`setPublicUserSession`, its own `rf_public_session` cookie, temp authorizations for e.g. one-off attachment access).

A single commission can be viewed by either kind of user (or anonymously), and much of the API branches on a `ViewAs` type (`'agent' | 'customer' | 'anon'`) that controls field projection (e.g. hiding `secure_note`, `internal_note`, customer PII). See `validateCommission` in `server/utils/database.ts` for the canonical "who is viewing this commission and what can they see" resolution — it checks both sessions and an agent-only `forceAgentView` setting that lets an artist preview a commission as its owning customer would see it.

### Server middleware pipeline

`server/middleware/*` run in filename order for every request:
1. `agent_auth.ts` — global auth gate. Every `/api/**` route is treated as restricted **unless** it's under `/api/auth`, `/api/_auth`, `/api/_nuxt_icon`, `/api/public`, or (test env only) `/api/test`. Restricted routes need either a valid session or the `X-RF-Service` header matching `runtime.backoffice.service` (used for server-to-server calls, e.g. from the "Geisha" service).
2. `test_only.ts` — 404s any `/api/test/**` call unless `isTestEnv`.

`bypassAuthForDev(event)` (dev-only, header `X-RF-Bypass: 1`) skips auth entirely — used for local tooling, never active outside `NODE_ENV=development`.

### Data layer — Mongo, no schema/ODM

- `server/utils/services/mongo.ts` holds a module-level singleton `MongoClient`/`Db` (`useMongo`, `useMongoCollection<T>`).
- Each collection has a "model" module under `server/utils/models/*.ts` exporting a `useXModel()` factory that returns an object of plain async functions (`getAll`, `getOneById`, `insertOne`, `updateOne`, `deleteOne`, ...). No class-based repositories — follow this factory-function convention for new models.
- Complex reads go through Mongo aggregation pipelines directly in the model (see `server/utils/models/commissions.ts` for the most involved example: nested character/changelog unwinding, per-`ViewAs` field exclusion, attachment metadata lookups from storage, and an in-place `schemaVersion` migration pattern via `normalizeAttachmentId`).
- Document schema evolution is handled by a `CURRENT_SCHEMA_VERSION` constant per model plus a lazy per-document `normalize*` step, in addition to the explicit migration scripts below — check both when a field's on-disk shape changes.
- Nitro auto-imports everything in `server/utils/services` and `server/utils/models` (configured in `nuxt.config.ts` `nitro.imports.dirs`), so model/service functions (`useCommissionModel`, `useMongoCollection`, etc.) are used without explicit imports anywhere in `server/`.

### Migrations

One-off DB migrations (distinct from the per-document `schemaVersion` normalization above) live in `scripts/migrations/*.ts`, each exporting `up(db)`, applied in filename order by `scripts/migrate.ts` and tracked in a `migrations` Mongo collection. `bun run migrate` is invoked in CI (`.github/workflows/migrate-db.yml`) before each deploy; `scripts/rollback.ts` is invoked automatically if the post-deploy canary E2E run fails.

### Shared code (`shared/`)

`shared/types/*.d.ts` and `shared/enums/*.ts` are usable from both `app/` and `server/` without import paths — Nuxt's shared dir plus `imports.dirs: ['shared/enums']` in `nuxt.config.ts` auto-import enums globally (e.g. `AuditAction`, `AuditCategory` are used unqualified). Types like `Permission`, `ViewAs`, `Commission*`, `Customer` are ambient/global via `.d.ts` — don't add explicit imports for them inside `server/` or `app/`. `shared/utils/*.ts` holds cross-boundary pure helpers (formatting, links, payment helpers).

### Auditing

`server/plugins/auditOperation.ts` hooks Nitro's `afterResponse` and matches the request path+method against a declarative `trackPerRoute` table to decide whether/how to log an audit entry (category/action from `shared/enums/Audit.ts`, both bitflag enums). Extra per-operation detail is attached by handlers via `event.context.audit` before the response completes (see `server/types/event-context.d.ts`). Skipped entirely in test env and for dev-bypassed requests. `auditPublicOperation.ts` is the equivalent for public/customer-facing actions.

### On-fly config system

App-wide runtime settings (not env vars) are stored in Mongo per `category` (`shared/enums/Config.ts` / `RedflareConfigCategory`) and read through `server/utils/config.ts`, which wraps reads in `defineCachedFunction` (Nitro's built-in cache, 30 min TTL) — always invalidate via `invalidateCachedConfigByCategory` after writing config, don't write to the model directly and expect it to reflect immediately.

### Frontend data flow

- API calls from `app/` go through `useAPI` (`app/composables/useAPI.ts`), a thin `$fetch` wrapper that forwards the `cookie` header during SSR so both the agent and public sessions work server-side.
- Reads are defined as Pinia Colada query options in `app/queries/*.ts` (`defineQueryOptions`); writes are grouped in `app/mutations/*.ts`. Prefer this pattern over ad-hoc `useAPI` calls in components for anything cached/reactive.
- Multi-step form state (commission builder, customer form, avatar base form) lives in dedicated Pinia stores under `app/stores/`, not component-local state.
- Route access control is declarative via `app/middleware/`: `auth.ts` (must be logged in as agent), `guest-only.ts` (must be logged out), `maintenance.global.ts` (global — redirects to `/maintenance` based on the `general.maintenanceMode` config category, with explicit carve-outs for dashboard/public API/public config routes).

### Deploy model

Deploys (`.github/workflows/deploy_staging.yml`, `deploy_release.yml`) build a Docker image, run DB migrations, then stand up a **canary** Cloud Run revision, run the full Playwright E2E suite against it (`FORCE_REMOTE=true`), and only promote to the primary service (`update-traffic --to-latest`) if the canary's E2E run passes. A failed canary E2E run triggers `scripts/rollback.ts` against the just-applied migrations. Keep this in mind when writing E2E tests — they gate production traffic promotion directly.
