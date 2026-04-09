# API

Base URL: `https://api.marketflow.app` (production) / `http://localhost:8787` (dev)

All routes except `/auth/*` require `Authorization: Bearer <jwt>`.

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

## Hierarchy
- `GET/POST /workspaces`
- `GET/PATCH/DELETE /workspaces/:id`
- `GET/POST /folders`, `PATCH/DELETE /folders/:id`
- `GET/POST /lists`, `PATCH/DELETE /lists/:id`
- `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/:id`

## Comments
- `GET/POST /comments`
- `PATCH/DELETE /comments/:id`

## Uploads
- `POST /uploads/presign` → returns presigned R2 URL

## Real-time
- `GET /ws/task/:id` → WebSocket upgrade to `SyncDocRoom` Durable Object
