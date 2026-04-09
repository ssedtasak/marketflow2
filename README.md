# MarketFlow

Cloudflare-native project management for marketing teams. ClickUp hierarchy + Google Docs real-time editing, all running on the edge.

See [PRD.md](./PRD.md) for full requirements and architecture.

## Stack

- **Frontend:** React + Vite + Tailwind → Cloudflare Pages
- **API:** Hono on Cloudflare Workers
- **DB:** Cloudflare D1 + Drizzle ORM
- **Real-time:** Durable Objects + Yjs
- **Storage:** Cloudflare R2

## Monorepo layout

```
apps/
  web/        React frontend (Cloudflare Pages)
  api/        Hono API + Durable Objects (Cloudflare Workers)
packages/
  shared/     Shared types and Zod schemas
  ui/         Shared React primitives
  config/     Shared ESLint / TS configs
docs/         Architecture, API, deployment docs
tools/        Dev scripts
```

## Getting started

```bash
pnpm install
pnpm dev:api    # Worker on :8787
pnpm dev:web    # Vite on :5173
```
