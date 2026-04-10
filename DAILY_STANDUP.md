# Daily Standup & Learning Log

## 2026-04-10 (Continued - Evening)

### UX Improvements Completed:
- **Kanban drag-and-drop fixed** - Now uses useDroppable for columns
- **Delete workspace function** - Added with admin-only RBAC check
- **Delete list function** - Trash icon in sidebar
- **Inline editing** - Priority and due date editable in ListView
- **Assignee display** - Shows in ListView column and Kanban cards
- **Custom status management** - Add/remove statuses via "Manage Statuses"
- **Kanban column reorder** - Drag headers to change order (saved to localStorage)
- **React error boundary** - No more white screen crashes
- **Calendar as default view** - Changed from List to Calendar

### Security Fixes:
- **Cascade delete** - Workspace delete now removes lists, tasks, members
- **POST /lists auth check** - Now requires workspace membership
- **GET /workspaces/:id/members auth** - Now checks membership
- **CORS flexible** - Accepts any marketflow-web.pages.dev subdomain
- **Auth bypass locked** - Only works from allowed origins

### Critical Bug Fixed:
- **Stale .js files** - 18 compiled .js files were conflicting with .tsx
- **Root cause**: tsconfig.json was missing `noEmit: true`
- **Fix**: Added `"noEmit": true` to apps/web/tsconfig.json
- **Prevention**: TypeScript will now only typecheck, not emit .js files

### Deployment URLs:
| Component | Status | URL |
|----------|--------|-----|
| Frontend | ✅ Deployed | https://2e10dfb8.marketflow-web.pages.dev |
| API | ✅ Deployed | https://marketflow-api.ssedtasak.workers.dev |
| Database | ✅ Ready | Cloudflare D1 |

### CTO Review Findings:
| Severity | Count | Top Issues |
|----------|-------|------------|
| Critical | 3 | .js files ✅, Auth stubs, SyncDoc |
| High | 8 | CORS, cascade deletes, validation |
| Medium | 10 | Error handling, real-time |
| Low | 4 | Code hygiene |

### Self-Learning System

**Memory entities:**
- `MarketFlow` - Project overview
- `TechDecisions` - Key architectural choices
- `Phase2Lessons` - Past bugs and fixes
- `SecurityFixes` - Security lessons
- `P1SecurityImplementation` - JWT/RBAC details
- `CommonBugs` - Recurring issues

### Common Bugs (Auto-Learned)

| Issue | Solution |
|-------|----------|
| Stale .js files cause errors | Delete them + add `noEmit: true` to tsconfig |
| CORS blocked | Add domain to allowed origins or use wildcard |
| ENVIRONMENT blocks bypass | Dev bypass only works with `x-bypass-auth` header |
| TypeScript emits .js | Add `"noEmit": true` to tsconfig.json |

### Before Starting Next Day

1. Run `pnpm typecheck` to verify no errors
2. Check for .js files: `find apps/web/src -name "*.js"` - delete any stale ones
3. Verify tsconfig.json has `"noEmit": true`
4. Test frontend: https://2e10dfb8.marketflow-web.pages.dev

---

## 2026-04-10 (Morning)

### What We Did

**P1 Security Implementation:**
- Replaced homemade JWT (btoa) with proper `hono/jwt` cryptographic signing
- Implemented real RBAC middleware checking workspace_members table
- Added workspace member authorization on lists/tasks routes
- Fixed frontend auth bypass (now checks VITE_ENVIRONMENT)
- Removed stub routes (folders, comments, uploads)

**Quality Gate System:**
- Added 4 new agents: surveyor, analyzer, risk-evaluator, critic
- CTO workflow updated with pre-flight quality gate
- All agents given memory tools for self-learning

**Testing & Deployment:**
- Local testing with dev mode bypass
- Deployed to Cloudflare Workers
- Created PR and merged to main

### Key Fixes Applied

1. **Homemade JWT vulnerability** - Replaced btoa() with hono/jwt for HS256 signing
2. **RBAC stub** - Implemented real role checking (admin/member/viewer)
3. **Auth bypass in production** - auth-context.tsx now checks VITE_ENVIRONMENT
4. **Stub routes security** - Removed folders/comments/uploads endpoints

---

## 2026-04-09

### What We Did

**Architecture Setup:**
- Initialized pnpm monorepo with React + Vite frontend and Hono + Cloudflare Workers API
- Set up D1 database with Drizzle ORM
- Configured GitHub Actions for CI/CD deployment

**Frontend MVP:**
- Built React SPA with List/Kanban/Calendar views
- Implemented Apple-style UI (minimal, white backgrounds, subtle shadows)
- Set up TanStack Query for data management
- Created dark sidebar with workspace/list hierarchy
- Fixed button handlers and form submissions

**Backend MVP:**
- Implemented CRUD for workspaces, lists, tasks
- Added dev mode auth bypass (auto-login as dev-user-1)
- Fixed foreign key constraints with dev user upsert
- Made `position` field optional in schemas (auto-generate UUID)

**Deployment:**
- Deployed to GitHub Pages: https://ssedtasak.github.io/marketflow2/
- Deployed API to Cloudflare Workers: https://marketflow-api.ssedtasak.workers.dev
- Updated Wrangler from v3 to v4

### Key Fixes Applied

1. **postcss.config.js missing** - Tailwind CSS wasn't processing, caused broken layout
2. **SVG icons unconstrained** - Added explicit width/height attributes
3. **.js files conflicting** - Old compiled JS files alongside .tsx files caused issues, deleted them
4. **Workspace auto-select** - Added useEffect to auto-select first workspace when loaded
5. **position field required** - Made optional in createTaskSchema, auto-generate UUID
6. **Dev user not exists** - Upsert dev-user-1 in auth middleware before operations
7. **R2 bucket requires paid plan** - Removed from wrangler.toml for MVP

### Lessons Learned

1. **Always delete conflicting .js files** when working with TypeScript - Vite may serve old compiled JS
2. **Check foreign key constraints** - Dev user must exist before creating resources
3. **position/index fields should be optional** - Auto-generate if not provided
4. **Cloudflare R2 requires paid plan** - Don't include in MVP wrangler.toml
5. **Wrangler v4 changes deployment** - Need to use local node_modules wrangler path
6. **GitHub Pages source = GitHub Actions** - Set in Pages settings before deploying

### Before Starting Next Day

1. Run `pnpm install` to ensure dependencies
2. Run `pnpm typecheck` to verify no errors
3. Check `.js` files exist alongside `.tsx` - delete if found
4. Verify API is deployed: `curl https://marketflow-api.ssedtasak.workers.dev/`
5. If wrangler deploy fails, check `wrangler login` is still valid

### Current Status

| Component | Status | URL |
|----------|--------|-----|
| Frontend | ✅ Deployed | https://ssedtasak.github.io/marketflow2/ |
| API | ✅ Deployed | https://marketflow-api.ssedtasak.workers.dev |
| Database | ✅ Ready | Cloudflare D1 |

### Next Steps (Phase 2)

1. Implement real magic link auth with Resend API
2. Add task assignment to workspace members
3. Implement drag-and-drop in Kanban view
4. Add due date picker to tasks
5. Set up R2 for file uploads (Phase 3)
