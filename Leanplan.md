# Leanplan.md — MarketFlow2 Phase 1

**Philosophy: Steve Jobs simplicity. Every function must earn its place. If users don't need it in Phase 1, cut it.**

---

## What we CUT (and why)

| Cut | Why |
|-----|-----|
| **Sessions table + DB check per request** | Stateless JWT is enough. Logout = client deletes token. No DB round-trip on every request. |
| **Spaces routes** | 5-level hierarchy is ClickUp complexity. Phase 1 needs Workspace → List → Task only. |
| **Folders routes** | Same reason. Add when users ask for it. |
| **Subtasks** | Flat tasks per list. Add depth when users beg for it. |
| **`GET /workspaces/:id/members`** | No invite system = no members to show. Dead endpoint. |
| **`PATCH /workspaces/:id`** | Not a Phase 1 need. |
| **`DELETE /workspaces/:id`** | Dangerous, complex (cascade), low usage. Cut. |
| **`POST /auth/logout`** | Logout = client discards token. Not a server concern. |
| **`utils/email.ts`** | One `fetch()` to Resend. Inline it — not worth a file. |
| **`utils/jwt.ts`** | Two lines inlined in middleware. Not worth a file. |
| **Service layer** (`taskService`, `workspaceService`, `storageService`) | One indirection layer that adds zero value in Phase 1. Delete these files. |
| **`custom_fields` + `custom_values` tables** | Phase 3+ feature. Dead weight in schema now. |
| **`spaces` + `folders` tables** | Not needed until Phase 2. |
| **`sessions` table** | Replaced by stateless JWT. |
| **`passwordHash` on users** | Replaced by magic link — no passwords. |

**Revised hierarchy for Phase 1: Workspace → List → Task. 13 endpoints total.**

---

## Auth strategy

**Magic Link (passwordless)** via Resend (one inline `fetch` call).

```
POST /auth/magic-link { email }
  → upsert user → store token in D1 (15min TTL) → Resend sends email → 200 { ok: true }

GET /auth/verify?token=
  → validate token (unused + not expired) → mark used=1 → sign 7-day JWT → 200 { token, user }
```

No passwords. No password resets. No session table. JWT is stateless — no DB call on every request.

---

## Lean rules

- No service layer — logic inline in route handlers
- No new npm packages — `hono/jwt`, `drizzle-orm`, `zod` only
- Zod `safeParse()` on every body → 400
- Error shape: `{ error: string }` for all 4xx
- `index.ts`, `middleware/error.ts`, `middleware/rateLimit.ts` → zero changes

---

## The 13 endpoints

```
POST /auth/magic-link      → send magic link email
GET  /auth/verify?token=   → verify token, return JWT

GET  /workspaces           → list workspaces I belong to
POST /workspaces           → create workspace
GET  /workspaces/:id       → get one workspace

GET  /lists?workspaceId=   → list lists in workspace
POST /lists                → create list
PATCH /lists/:id           → rename list
DELETE /lists/:id          → delete list (tasks first)

GET  /tasks?listId=        → list tasks in list
GET  /tasks/:id            → get single task
POST /tasks                → create task
PATCH /tasks/:id           → update task
DELETE /tasks/:id          → delete task
```

---

## Todo list

### Status legend
- [ ] Not started
- [x] Done

### Files to DELETE
- [ ] `apps/api/src/services/taskService.ts`
- [ ] `apps/api/src/services/workspaceService.ts`
- [ ] `apps/api/src/services/storageService.ts`
- [ ] `apps/api/src/utils/jwt.ts`

### Schema (`apps/api/src/db/schema.ts`) — ✅ Done
- [x] Remove `passwordHash` from `users`
- [x] Remove `sessions` table
- [x] Remove `spaces` + `folders` + `custom_fields` + `custom_values` tables
- [x] Add `magic_tokens(id, email, expiresAt, used)` table
- [x] Update `lists` → `workspaceId` directly
- [x] Update `tasks.status` enum → `todo | in_review | approved | done`
- [x] Add `tasks.needsApproval`, `tasks.approvedBy`, `tasks.approvedAt`
- [x] Remove `tasks.parentTaskId` (no subtasks Phase 1)
- [x] Remove `tasks.startDate` (dueDate is enough)
- [x] Default view → `calendar` (deadline-first)

### Shared schemas (`packages/shared/src/schemas.ts`)
- [ ] Replace `loginSchema` + `registerSchema` with `magicLinkSchema = z.object({ email: z.string().email() })`
- [ ] Add `createListSchema = z.object({ workspaceId: z.string(), name: z.string().min(1).max(80) })`
- [ ] Update `createTaskSchema` → `{ listId, title, status?, priority?, dueDate?, needsApproval? }`

### Constants (`packages/shared/src/constants.ts`) — ✅ Done
- [x] `TASK_STATUSES = ['todo', 'in_review', 'approved', 'done']`
- [x] `DEFAULT_VIEW = 'calendar'`
- [x] `MAGIC_TOKEN_TTL_SECONDS = 900` (15 min)
- [x] `JWT_TTL_SECONDS = 604800` (7 days)

### Config (`apps/api/wrangler.toml`)
- [ ] Add `RESEND_API_KEY` secret (`wrangler secret put RESEND_API_KEY`)
- [ ] Add `APP_URL` var (`http://localhost:5173` for dev)

### Middleware (`apps/api/src/middleware/auth.ts`)
- [ ] Extract Bearer token → 401 if missing
- [ ] `verify(token, JWT_SECRET)` from `hono/jwt` in try/catch → 401 on error
- [ ] `c.set('userId', payload.sub)` → `next()`
- [ ] No DB call — stateless JWT only

### Auth routes (`apps/api/src/routes/auth.ts`)
- [ ] `POST /auth/magic-link` — validate `magicLinkSchema`, `INSERT OR IGNORE` user, insert magic_token, inline Resend `fetch`, → 200 `{ ok: true }` always
- [ ] `GET /auth/verify?token=` — lookup token, check `used=0` + not expired → 400, mark `used=1`, `sign({ sub: userId }, JWT_SECRET)`, → 200 `{ token, user: { id, email } }`

### Workspaces (`apps/api/src/routes/workspaces.ts`)
- [ ] `GET /workspaces` — JOIN `workspace_members` → `workspaces` WHERE `userId`
- [ ] `POST /workspaces` — validate name, insert workspace + insert member as `admin` → 201
- [ ] `GET /workspaces/:id` — check membership → 404, return workspace

### Lists (`apps/api/src/routes/lists.ts`)
- [ ] Inline `assertMember(db, workspaceId, userId)` → member | null (1 DB query)
- [ ] `GET /lists?workspaceId=` — assertMember → 404, SELECT ordered by `CAST(position AS REAL)`
- [ ] `POST /lists` — validate, assertMember, `MAX(position)+1`, insert → 201
- [ ] `PATCH /lists/:id` — fetch list, assertMember(list.workspaceId), update name → 200
- [ ] `DELETE /lists/:id` — fetch list, assertMember, delete tasks, delete list → 200

### Tasks (`apps/api/src/routes/tasks.ts`)
- [ ] Inline `assertMemberViaList(db, listId, userId)` → list | null (2 DB queries: list → workspaceMember)
- [ ] `GET /tasks?listId=` — assertMemberViaList → 404, SELECT ordered by position
- [ ] `GET /tasks/:id` — fetch task, assertMemberViaList → 200
- [ ] `POST /tasks` — validate, assertMemberViaList, `MAX(position)+1`, insert → 201
- [ ] `PATCH /tasks/:id` — validate partial + status field, fetch, assertMemberViaList, update defined fields only → 200
- [ ] `DELETE /tasks/:id` — fetch, assertMemberViaList, delete → 200

---

## Verification

- [ ] `pnpm --filter @marketflow/api typecheck` → 0 errors
- [ ] `wrangler dev` starts on :8787
- [ ] Smoke test sequence:
  1. `POST /auth/magic-link { email }` → 200
  2. Click link → `GET /auth/verify?token=` → 200 `{ token }`
  3. Same token again → 400 (one-time use)
  4. `GET /workspaces` with Bearer → 200 `[]`
  5. `POST /workspaces` → 201
  6. `POST /lists` → 201
  7. `POST /tasks` → 201
  8. `PATCH /tasks/:id` → 200
  9. Invalid/expired token → 401
