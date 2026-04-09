# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MarketFlow — Cloudflare-native project management tool for marketing teams. ClickUp-style hierarchy (Workspace → Space → Folder → List → Task) with Google Docs-style real-time collaborative editing per task.

Stack: **React + Vite** (Cloudflare Pages) · **Hono** (Cloudflare Workers) · **Drizzle + D1** (SQLite) · **Durable Objects + Yjs** (real-time) · **R2** (assets) · **pnpm monorepo**

## Lean principles

- **No Zustand.** TanStack Query owns server state. Use `useState`/`useContext` for local UI state. Add Zustand only if a concrete cross-tree state problem emerges.
- **Yjs + Tiptap are lazy.** They live in the `editor` Vite chunk and are `React.lazy()`-loaded only when a task's Sync Doc is opened. Never import them in the main bundle.
- **Cloudflare Queues deferred.** Do not add the Queues binding or producer code until Phase 3 work begins.
- **shadcn/ui: install per component.** Run `pnpm dlx shadcn@latest add <component>` for each component needed. Never bulk-install the whole library.
- **No new npm dependency without justification.** Every addition must solve a problem that cannot be solved with what's already installed.

## Commands

```bash
# Install all workspace packages
pnpm install

# Dev servers
pnpm dev:web          # Vite frontend on :5173
pnpm dev:api          # Wrangler Worker on :8787

# Individual packages
pnpm --filter @marketflow/web dev
pnpm --filter @marketflow/api dev

# Type checking (run before any PR)
pnpm typecheck        # runs tsc --noEmit across all packages

# Lint
pnpm lint

# Tests
pnpm test

# API: generate Drizzle migration from schema changes
pnpm --filter @marketflow/api db:generate

# API: apply migrations locally
pnpm --filter @marketflow/api db:migrate

# API: dry-run deploy (typecheck + bundle)
pnpm --filter @marketflow/api build

# Frontend: production build
pnpm --filter @marketflow/web build
```

## Architecture

### Monorepo layout

```
apps/web/     React SPA → Cloudflare Pages
apps/api/     Hono on Workers → REST API + WebSocket → Durable Objects
packages/shared/   Zod schemas + shared TypeScript types (source of truth for API contracts)
packages/ui/       Shared React primitives
packages/config/   Shared ESLint / TS configs
```

### API (`apps/api/`)

- Entry: `src/index.ts` — mounts all Hono route groups, wires CORS/error middleware, and forwards `/ws/task/:id` to Durable Objects.
- Routes: one file per resource in `src/routes/`. All routes except `/auth/*` use the `requireAuth` middleware from `src/middleware/auth.ts`.
- Database: Drizzle ORM over D1. Client created in `src/db/client.ts`. Schema in `src/db/schema.ts` — edit here and run `db:generate` to produce migrations.
- Real-time: `src/durable-objects/SyncDocRoom.ts` — one DO instance per task, holds a Y.Doc in memory, broadcasts Yjs update messages over WebSocket, persists snapshot to D1 on idle/shutdown.
- Cloudflare bindings declared in `wrangler.toml`: `DB` (D1), `ASSETS` (R2), `SYNC_DOC` (Durable Object namespace).

### Frontend (`apps/web/`)

- `src/lib/api.ts` — typed Hono RPC client (will use Hono's `hc` once routes are typed end-to-end).
- `src/lib/yjs-provider.ts` — WebSocket provider connecting a Y.Doc to `SyncDocRoom`.
- `src/hooks/useYDoc.ts` + `src/hooks/useAwareness.ts` — Yjs document attachment and multiplayer cursor state.
- Components are organized by concern: `hierarchy/` (sidebar tree), `views/` (List/Kanban/Calendar), `sync-doc/` (Tiptap editor), `ui/` (shadcn primitives), `layout/`.

### Shared package (`packages/shared/`)

Zod schemas in `src/schemas.ts` are the **single source of truth** for request/response shapes. Import from `@marketflow/shared/schemas` in both the API (for validation) and the frontend (for form validation). Types in `src/types.ts` mirror the D1 schema.

### Data model key points

- Hierarchy IDs are strings (UUIDs). `position` fields use fractional indexing strings for drag-and-drop ordering without cascade updates.
- `tasks.ydoc_state` (BLOB) is the serialized Yjs document — written by the Durable Object, read on room open to restore prior content.
- RBAC roles (`admin` | `member` | `viewer`) are stored in `workspace_members` and enforced by `src/middleware/rbac.ts`.

### Build phases (from PRD)

| Phase | Status | Scope |
|-------|--------|-------|
| 1 | Todo | Auth + hierarchy CRUD + List/Kanban/Calendar views |
| 2 | Todo | Durable Objects + Yjs real-time Sync Doc |
| 3 | Todo | R2 uploads + comments + @mentions + Queues notifications |
| 4 | Todo | RBAC hardening + Turnstile + WAF + production polish |

## Agent team (`.factory/droids/`)

Role-specific agent prompts for working in this repo. The `cto` droid coordinates; specialized droids handle frontend, backend, QA, devops, docs, and research. Always check the relevant droid's `.md` before delegating work to understand its conventions and quality gates.

> Note: the `backend-worker` and `devops-worker` droids still reference Express/PostgreSQL/Railway from a prior version — treat the PRD and this CLAUDE.md as authoritative for stack decisions.

## Deploy (one-time setup)

```bash
wrangler d1 create marketflow-db          # paste ID into apps/api/wrangler.toml
wrangler r2 bucket create marketflow-assets
wrangler secret put JWT_SECRET --name marketflow-api

# Deploy API
pnpm --filter @marketflow/api deploy

# Deploy frontend
pnpm --filter @marketflow/web build
wrangler pages deploy apps/web/dist --project-name marketflow-web
```
