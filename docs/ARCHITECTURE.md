# Architecture

See `PRD.md` sections 4 and 9 for the full stack and real-time design.

## High level

```
Browser (React + Yjs)
  │
  ├─ HTTPS ──► Cloudflare Pages (static assets)
  │
  ├─ HTTPS ──► Workers (Hono API) ──► D1 (SQLite)
  │                              └─► R2 (assets)
  │
  └─ WSS ───► Workers ──► SyncDocRoom DO (Yjs room per task)
```

## Request flow

1. User loads the SPA from Pages.
2. React calls the Worker API via typed Hono RPC client.
3. Workers read/write D1 through Drizzle ORM.
4. Opening a task establishes a WebSocket to `/ws/task/:id`, which is forwarded to a Durable Object that holds the Y.Doc in memory and broadcasts updates.
5. Assets are uploaded directly to R2 via presigned URLs issued by the Worker.
