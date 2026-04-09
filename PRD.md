# Product Requirements Document (PRD): **MarketFlow**

**Version:** 3.0 (Lean Edition)
**Status:** In Development — Phase 1
**Target Audience:** Marketing Teams (Creative, SEO, Social, Product Marketing)

---

## 1. Executive Summary

MarketFlow is a deadline-first project management tool built entirely on the Cloudflare edge. It is purpose-built for marketing teams — not generic knowledge workers. Every design decision comes from one question: *what does a marketing team actually need to ship campaigns on time?*

The answer: visibility into deadlines, a clear approval workflow, and context (brief, copy, assets) living with the task — not scattered across email and Slack.

---

## 2. Core Philosophy

**Five first principles for marketing PM:**

| Principle | What it means |
|-----------|--------------|
| **Deadline is sacred** | The calendar IS the roadmap. Calendar view is the default, not list view. |
| **Status = "will this ship on time?"** | Four statuses only: `todo → in_review → approved → done`. No custom status systems. |
| **Context travels with the task** | Brief, copy draft, and feedback live in the Sync Doc attached to every task. |
| **Approval is part of the workflow** | Tasks have a `needsApproval` flag and `approved` status. Not an afterthought. |
| **Campaigns repeat** | List templates (Phase 2) let teams reuse campaign structures without rebuilding from scratch. |

**Guiding principle: Steve Jobs simplicity. Every function must earn its place. Cut until it hurts, then cut a little more.**

---

## 3. Functional Requirements

### 3.1 Hierarchy — Lean for Phase 1

Phase 1 hierarchy: **Workspace → List → Task**

Spaces and Folders (deeper hierarchy) are deferred to Phase 2. Teams don't need 5 levels on day one — they need to ship campaigns.

### 3.2 Task Model

Every task has:
- Title, status (`todo | in_review | approved | done`), priority, assignee, due date
- `needsApproval` flag — marks tasks that require sign-off before publishing
- `approvedBy` + `approvedAt` — traceability of who approved and when
- Sync Doc (Phase 2) — real-time collaborative document attached to the task

### 3.3 Views

| View | Purpose | Phase |
|------|---------|-------|
| **Calendar** | Default view. Maps tasks to due dates. Deadline visibility at a glance. | 1 |
| **List** | Structured table for bulk status updates. | 1 |
| **Kanban** | Drag-and-drop through `todo → in_review → approved → done`. | 1 |

### 3.4 Auth — Magic Link (Passwordless)

No passwords. Users enter their email → receive a magic link → click → get a 7-day JWT. Stateless auth, no session table, no password resets.

### 3.5 Sync Doc (Phase 2)

Opening a task reveals the Sync Doc — a real-time rich-text canvas (Tiptap + Yjs) where the team writes briefs, copy drafts, and feedback. Multiple users edit simultaneously with live cursors. Lazy-loaded — not in the main bundle.

### 3.6 Asset Management (Phase 3)

Campaign assets (images, PDFs, videos) uploaded directly to Cloudflare R2 via presigned URLs and embedded in the Sync Doc.

### 3.7 Notifications (Phase 3)

In-app and email alerts via Cloudflare Queues when a task status changes or approval is needed.

---

## 4. Technical Architecture

100% Cloudflare-native. No central servers. Single vendor.

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React + Vite + Tailwind → Cloudflare Pages | Global SPA, code-split by route |
| **API** | Hono on Cloudflare Workers | REST API at the edge, <50ms globally |
| **Database** | Cloudflare D1 (SQLite) + Drizzle ORM | Relational data — workspaces, lists, tasks |
| **Real-time** | Cloudflare Durable Objects + Yjs | One DO per task = one Sync Doc room (Phase 2) |
| **Storage** | Cloudflare R2 | Campaign assets, zero egress fees (Phase 3) |
| **Email** | Resend (single `fetch` call) | Magic link delivery |
| **Security** | Cloudflare WAF + Turnstile | Rate limiting, bot protection (Phase 4) |

### Data model (Phase 1)

```
users            (id, email, name, createdAt)
workspaces       (id, name, ownerId, createdAt)
workspace_members(workspaceId, userId, role)        ← admin | member | viewer
lists            (id, workspaceId, name, position, defaultView)
tasks            (id, listId, title, status, priority, assigneeId,
                  dueDate, position, needsApproval, approvedBy,
                  approvedAt, ydocState, createdAt)
magic_tokens     (id, email, expiresAt, used)
```

### API surface (Phase 1 — 13 endpoints)

```
POST /auth/magic-link      → send magic link
GET  /auth/verify?token=   → verify token, return JWT

GET  /workspaces           → list my workspaces
POST /workspaces           → create workspace
GET  /workspaces/:id       → get workspace

GET  /lists?workspaceId=   → list campaigns
POST /lists                → create campaign list
PATCH /lists/:id           → rename list
DELETE /lists/:id          → delete list

GET  /tasks?listId=        → list deliverables
GET  /tasks/:id            → get deliverable
POST /tasks                → create deliverable
PATCH /tasks/:id           → update (status, approval, assignee, due date)
DELETE /tasks/:id          → delete deliverable
```

### Lean rules (enforced in code)

- No service layer — logic inline in route handlers
- No session table — stateless JWT, logout is client-side
- No new npm packages beyond `hono`, `drizzle-orm`, `zod`
- Yjs + Tiptap lazy-loaded in a separate Vite chunk (Phase 2 only)
- Cloudflare Queues added only when Phase 3 begins
- shadcn/ui installed per-component, never bulk

---

## 5. Roadmap

### Phase 1 — Foundation *(current)*
- [x] pnpm monorepo scaffold
- [x] Lean D1 schema (6 tables)
- [x] `todo → in_review → approved → done` status model
- [x] Approval fields on tasks (`needsApproval`, `approvedBy`, `approvedAt`)
- [ ] Magic link auth (Resend)
- [ ] Stateless JWT middleware
- [ ] Workspace + List + Task CRUD (13 endpoints)
- [ ] React frontend: auth, sidebar, Calendar / List / Kanban views

### Phase 2 — Real-Time Sync Doc
- [ ] Tiptap + Yjs integration (lazy-loaded editor chunk)
- [ ] Durable Object per task — WebSocket room
- [ ] Live multiplayer cursors via `y-protocols/awareness`
- [ ] Persist Y.Doc snapshot to D1 on room shutdown
- [ ] Real-time status updates across views (workspace-level DO broadcast)
- [ ] List templates — reuse campaign structures

### Phase 3 — Assets & Collaboration
- [ ] R2 bucket + presigned URL endpoint
- [ ] Direct browser → R2 uploads
- [ ] Inline asset embeds in Sync Doc
- [ ] Threaded comments + @mentions in Sync Doc
- [ ] Cloudflare Queues → approval request notifications

### Phase 4 — Production Hardening
- [ ] Cloudflare Turnstile on magic link endpoint
- [ ] WAF rate-limiting rules
- [ ] RBAC enforcement: viewer cannot edit, member cannot approve
- [ ] Performance: lazy images, virtualized long lists
- [ ] Observability: Workers Analytics + Logpush

---

## 6. Non-Functional Requirements

- **Latency:** API responses < 50ms globally (Cloudflare edge)
- **Auth:** Magic link token expires in 15 minutes, one-time use
- **JWT:** Stateless, 7-day expiry, no revocation in Phase 1
- **Real-time:** Yjs CRDTs ensure offline edits merge without conflict (Phase 2)
- **Scalability:** Cloudflare serverless auto-scales — no manual intervention during campaign launch spikes
- **Bundle:** Editor chunk (Yjs + Tiptap) never loads until a task is opened
