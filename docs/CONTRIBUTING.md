# Contributing

## Prerequisites
- Node.js 20+
- pnpm 9+
- Wrangler (`npm i -g wrangler`) for local Workers/D1 dev

## Development

```bash
pnpm install
pnpm dev:api   # Worker on :8787
pnpm dev:web   # Vite on :5173
```

## Conventions
- TypeScript strict mode everywhere
- Zod schemas in `packages/shared` are the source of truth for API contracts
- Drizzle migrations live in `apps/api/src/db/migrations`
- Frontend follows the 4px spacing scale and minimalist Notion-style aesthetic per `frontend-worker.md`

## Before opening a PR
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
