# Daily Standup & Learning Log

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
