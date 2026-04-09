# Repository Guidelines

MarketFlow is a Cloudflare-native project management tool for marketing teams, built with React + Vite + Hono + D1 + Durable Objects.

## Project Structure

```
Marketflow2/
├── apps/
│   ├── api/          # Hono API (Cloudflare Workers)
│   │   └── src/
│   │       ├── routes/       # One file per resource
│   │       ├── durable-objects/  # SyncDocRoom.ts
│   │       ├── db/           # Drizzle schema + client
│   │       └── middleware/   # auth.ts, rbac.ts
│   └── web/          # React SPA (Cloudflare Pages)
│       └── src/
│           ├── components/   # hierarchy/, views/, sync-doc/, ui/, layout/
│           ├── hooks/       # useYDoc.ts, useAwareness.ts
│           └── lib/          # api.ts, yjs-provider.ts
├── packages/
│   ├── shared/       # Zod schemas + TypeScript types
│   ├── ui/           # Shared React primitives
│   └── config/       # ESLint / TS configs
├── docs/             # Architecture docs
├── tools/            # Dev scripts
└── .factory/droids/  # Agent team configs
```

## Build Commands

```bash
pnpm install           # Install all workspace packages
pnpm dev:web           # Frontend on :5173
pnpm dev:api           # API on :8787
pnpm typecheck         # Run tsc --noEmit across all packages
pnpm lint              # Lint all packages
pnpm test              # Run all tests
pnpm --filter @marketflow/api db:generate   # Generate Drizzle migration
pnpm --filter @marketflow/api db:migrate     # Apply migrations locally
```

## Coding Conventions

- **State management:** TanStack Query for server state. `useState`/`useContext` for local UI. No Zustand.
- **Yjs + Tiptap:** Must be lazy-loaded via `React.lazy()` in the `editor` Vite chunk. Never import in main bundle.
- **shadcn/ui:** Install per component: `pnpm dlx shadcn@latest add <component>`. Never bulk-install.
- **Dependencies:** No new npm packages without justification.
- **Schemas:** Zod schemas in `packages/shared/src/schemas.ts` are the single source of truth for API contracts.

## Architecture Notes

- **API routes:** All routes except `/auth/*` use `requireAuth` middleware from `src/middleware/auth.ts`.
- **Database:** Drizzle ORM over D1. Edit `src/db/schema.ts` then run `db:generate` to produce migrations.
- **Real-time:** One Durable Object per task (`SyncDocRoom.ts`). Holds Y.Doc in memory, persists to D1 on shutdown.
- **RBAC:** Roles (`admin` | `member` | `viewer`) enforced in `src/middleware/rbac.ts`.

## Deployment

```bash
# Deploy API
pnpm --filter @marketflow/api deploy

# Deploy frontend
pnpm --filter @marketflow/web build
wrangler pages deploy apps/web/dist --project-name marketflow-web
```

## Agent Team

Use droids from `.factory/droids/` for delegation. Check each droid's `.md` before delegating. The `cto` droid coordinates; specialized droids handle frontend, backend, QA, devops, docs, and research.

## Self-Improvement Loop

When something breaks, run this loop:

```
1. Catch    →  Identify the failure point
2. Diagnose →  Root cause: code, config, or dependency?
3. Fix      →  Apply the minimum change needed
4. Verify   →  Confirm the fix works (pnpm typecheck && pnpm build)
5. Document →  Log in the relevant file
6. Ship     →  Resume with a stronger system
```

### Where to Document

| Failure type | Document |
|--------------|----------|
| Code bug | Fix in source file; comment what was wrong |
| Schema issue | `apps/api/src/db/schema.ts` + regenerate migration |
| API contract mismatch | `packages/shared/src/schemas.ts` |
| Build/deploy issue | `docs/` or relevant `.md` file |
| New scenario not covered | Add to this file or relevant workflow |

### Anti-Patterns

- Don't patch and forget — document or it breaks again
- Don't skip `pnpm typecheck` before calling it fixed
- Don't blame the model — usually a config or code issue
