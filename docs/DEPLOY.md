# Deploy

## One-time setup

```bash
# Create D1 database
wrangler d1 create marketflow-db
# → copy the database_id into apps/api/wrangler.toml

# Create R2 bucket
wrangler r2 bucket create marketflow-assets

# Set secrets
wrangler secret put JWT_SECRET --name marketflow-api
```

## Deploy

```bash
# API (Workers + D1 + DO + R2)
pnpm --filter @marketflow/api deploy

# Frontend (Pages)
pnpm --filter @marketflow/web build
wrangler pages deploy apps/web/dist --project-name marketflow-web
```

## Migrations

```bash
pnpm --filter @marketflow/api db:generate
wrangler d1 migrations apply marketflow-db --remote
```
