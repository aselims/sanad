# Improvement Spec — sanad

> Generated 2026-07-12 by automated repository analysis. This document is the single source of
> truth for improving the `sanad` repository. It is written for an agent (e.g. Claude Opus) starting
> in a **fresh session with zero prior context**. Every task names exact files and line numbers.
> Do not assume any facts about the repo that are not stated here — verify with the code.

---

## Context

### What this app is
**Sanad** (product/brand name "Collopi", hosted at `collopi.com`, GitHub `aselims/sanad`) is an
open-source **innovation collaboration platform**. It connects innovators, researchers, startups,
corporates, government bodies, and investors. Core features: role-based user profiles, "collaborations"
(which are three sub-types — **Challenges**, **Partnerships**, and **Ideas**), a connection/networking
system, direct messaging, notifications, file sharing on collaborations, milestone/progress tracking,
a static markdown Blog, and an **AI-powered natural-language search** feature.

### Stack
- **Monorepo layout** (npm, no workspaces tool — plain nested `package.json` files):
  - `/backend` — Node.js + Express + TypeScript, TypeORM + PostgreSQL, Passport.js (JWT + local
    strategies), Winston logging, Multer file uploads. Entry point `backend/src/index.ts`.
  - `/frontend` — React 18 + TypeScript + Vite + Tailwind + React Router v7, Axios. Entry
    `frontend/src/main.tsx` / `frontend/src/App.tsx`.
  - `/packages/react-blog-module` — a local React blog package.
  - Root `package.json` uses `concurrently` to run both; scripts `npm start`, `npm run build`, etc.
- **AI**: Uses the `openai` npm SDK pointed at **Groq's** OpenAI-compatible endpoint
  (`https://api.groq.com/openai/v1`), model `llama-3.1-8b-instant`. The env var is confusingly named
  `OPENAI_API_KEY` but must hold a Groq key (`gsk_...`). See `backend/src/services/ai-search.service.ts`.
- **Deploy**: Docker Compose. `docker-compose.prod.yml` (prod) plus dev compose files parked in
  `Quarantine/docker-configs/`. Nginx reverse proxy: root `nginx.conf` (host-level, `collopi.com`,
  Let's Encrypt SSL) and `frontend/nginx.conf` (inside the frontend container). CI/CD in
  `.github/workflows/ci-cd.yml` deploys over SSH on push to `main`.

### Current state (as observed)
- `git status`: clean working tree, branch `main`, up to date with origin.
- Recent commits: `be669f3 seeddb`, `a41e25b increased limits` (added smart rate limiting +
  `optionalAuthentication`), `c9e0cb2 enhanced AI search`, `4fa584d added AI Search`.
- **`node_modules` is NOT installed** in either `backend/` or `frontend/`. Typecheck/lint/build could
  not be run during analysis. Any task that says "run typecheck/build" requires
  `npm install` first (do NOT assume it is done).
- **Tests**: backend `test` script is a stub (`echo "Error: no test specified" && exit 1`); there is
  one file `backend/src/__tests__/api.test.ts`. Frontend has Jest configured with a few tests
  (`frontend/src/services/__tests__/`, `frontend/src/components/__tests__/`).
- `Quarantine/` holds superseded/legacy files: old Dockerfiles, dev docker-compose variants, and the
  `dev.sh` / `prod.sh` scripts. **Note**: the root `README.md` and `CLAUDE.md` still instruct users to
  run `./dev.sh` and `./prod.sh`, but those scripts live only in `Quarantine/scripts/` and are NOT at
  repo root — the documented commands will fail. The CI workflow also references `./dev.sh` and
  `docker-compose.dev-remote.yml` which are quarantined (see Finding H4).

### How the AI search works (so you don't have to reverse-engineer it)
`GET /api/ai-search?q=...` → `optionalAuthentication` → `smartAISearchRateLimit` → `aiSearch(query)`
in `backend/src/services/ai-search.service.ts`. That function (1) calls Groq to extract
intent/entities/synonyms, (2) loads **all** users/challenges/partnerships/ideas from the DB with
`getMany()`, (3) scores every row in JS with fuzzy (Levenshtein) matching, (4) dedupes and returns
top 50. A separate `backend/src/services/database-search.service.ts` implements a Postgres full-text
alternative against a view `v_searchable_content` — but it is **never imported/called anywhere**
(dead code; the view + indexes only exist if `AddSearchIndexes.sql` was run manually).

---

## Findings

Severity legend: **Critical** (security / data-loss / prod-breaking), **High** (serious bug or
security weakness), **Medium** (correctness / maintainability), **Low** (polish / tech debt).

### CRITICAL

**C1 — Privilege escalation: any user can set their own role (including `admin`) on register and on profile update.**
- `backend/src/controllers/auth.controller.ts:16` — `register` destructures `role` straight from
  `req.body` (`const { ..., role = UserRole.INDIVIDUAL } = req.body`) and persists it. A client can
  `POST /api/auth/register` with `{"role":"admin"}` and become an admin.
- `backend/src/routes/api.ts:256` (`PUT /api/users/me`) and `:297` (`PUT /api/users/:id`) both do
  `userRepository.merge(user, req.body)` with no field allow-list. `PUT /api/users/me` lets any
  authenticated user overwrite **any** column on their own row — including `role`, `isVerified`,
  `isActive`, `email`, and even `password` (which would be stored **unhashed**, silently breaking
  login for that account and bypassing the register password-hash path).
- Evidence: admin gate elsewhere relies on `req.user.role === 'admin'` (`api.ts:277`), so escalating
  `role` grants the admin-only `PUT /api/users/:id` endpoint.

**C2 — Hardcoded fallback JWT secret shipped in code.**
- `backend/src/config/passport.ts:10` and `backend/src/utils/jwt.ts:6` both default `JWT_SECRET` to the
  literal string `'your_jwt_secret_key_change_in_production'` when the env var is unset. If the app ever
  boots without `JWT_SECRET` (e.g. env file misconfigured), tokens are signed/verified with a public,
  well-known secret → anyone can forge admin tokens. The default should not exist; a missing secret must
  crash startup.

**C3 — CI/CD deploys with hardcoded default Postgres credentials and runs dev tooling in "production".**
- `.github/workflows/ci-cd.yml:64-70` writes a `.env` on the server with
  `POSTGRES_PASSWORD=postgres` / `POSTGRES_USER=postgres` (also missing `JWT_REFRESH_SECRET`,
  `DB_NAME`/`DB_USER`/`DB_PASSWORD` that `docker-compose.prod.yml` expects).
- `.github/workflows/ci-cd.yml:82` runs `./dev.sh --remote` (a **development** script, and one that
  lives in `Quarantine/scripts/` — not at the path CI invokes) and `:91` uses
  `docker-compose.dev-remote.yml`. So the "production" pipeline actually launches the dev stack with a
  trivial DB password on a public server. This is a live security exposure.

### HIGH

**H1 — Committed demo credentials + secret-shaped placeholders in the repo.**
- `frontend/innovator_logins.txt` is committed and lists working demo emails/passwords
  (`startup@example.com` / `Startup123!`, etc.). It is served from the frontend build context.
- `backend/src/scripts/seed-database.ts:20-21` seeds an **admin** account
  `admin@sanad.sa` / `Admin123!` and dozens of `Password123!` accounts. `deploy.sh` and the CI
  workflow run the seed on deploy, so these live, guessable admin credentials likely exist in prod.
- `.env.production` is committed (values are redacted to `xxx`, but the file should not be tracked at
  all — `.gitignore:49` lists `.env` but `.env.production` is tracked; confirm with `git ls-files`).
  Historically a real base64 `JWT_SECRET` was committed in an old `.env` (git history commit around
  `5c1554f`), so **rotate `JWT_SECRET` regardless**.

**H2 — `PUT /api/users/me` stores an unhashed password and has no input validation (subset of C1, called out separately because the fix differs).**
- `backend/src/routes/api.ts:235-265`. Because `merge(user, req.body)` + `save()` runs the value
  through TypeORM directly, a `password` in the body is written verbatim. There is a dedicated
  `POST /api/auth/change-password` endpoint that hashes correctly; profile update must **never** touch
  `password`, `role`, `isVerified`, `isActive`, or `email` without explicit handling.

**H3 — AI search loads entire tables into memory on every request (unbounded, O(rows × terms) scoring).**
- `backend/src/services/ai-search.service.ts:187-215` calls `.getMany()` on Users, Challenges,
  Partnerships, and Ideas with no `WHERE`/`LIMIT`, then scores every row in JS with Levenshtein
  distance per search term. This does not scale past a few thousand rows and will OOM / time out as
  data grows. The purpose-built `database-search.service.ts` (Postgres full-text) exists but is dead
  code — it is never called. The whole `AI_Search_Analysis_and_Improvements.md` "50-70% faster"
  claim depends on indexes/view that are only created if `AddSearchIndexes.sql` was run by hand.

**H4 — Documented and CI-referenced scripts/compose files don't exist at their referenced paths.**
- `README.md` and `CLAUDE.md` tell users to run `./dev.sh` / `./prod.sh`; these live only in
  `Quarantine/scripts/`. `.github/workflows/ci-cd.yml:82,91` references `./dev.sh` and
  `docker-compose.dev-remote.yml` (quarantined). Result: the documented dev workflow and the CI
  deploy are both broken or silently pull from unexpected locations. The only compose file at repo
  root is `docker-compose.prod.yml`.

**H5 — AI search feature has zero handling for a missing/invalid Groq key beyond silent degradation, and the exposed metadata always claims full functionality.**
- `ai-search.service.ts:96-99` constructs the OpenAI/Groq client with
  `apiKey: process.env.OPENAI_API_KEY`. `.env.production` ships
  `OPENAI_API_KEY=sk-placeholder-update-with-real-key` (a non-Groq placeholder). When the key is bad,
  `processQueryWithAI` swallows the error and falls back to `entities:[query]` (lines ~166-176), so
  search silently loses all its "AI" value while `api.ts:349-355` still returns
  `searchEnhancements:{intentDetection:true,...}`. There is no health signal that AI is degraded.

### MEDIUM

**M1 — `optionalAuthentication` and `authenticateJWT` use a 5s `setTimeout` race that can double-call `next()`.**
- `backend/src/middlewares/auth.ts:16-33` and `:91-114` (added in commit `a41e25b`). A `setTimeout`
  calls `next()` after 5s; the passport callback also calls `next()` when it resolves. If passport
  resolves after the timeout already fired, `next()` runs twice → "headers already sent" errors /
  undefined behavior. JWT verification is synchronous+DB-bound and does not need a manual timeout;
  this is an anti-pattern. Remove the timeout or guard with a `settled` flag.

**M2 — In-memory rate-limit store is per-process and lost on restart; won't work across multiple backend replicas.**
- `backend/src/middlewares/rateLimit.ts:11` uses a module-level `Map`. `docker-compose.prod.yml` runs a
  single backend container so it works today, but it silently resets on every deploy/restart and can't
  scale horizontally. The file's own comment (`:9-10`) acknowledges Redis is the real answer. Also the
  key uses `req.route?.path || req.path`, and IP is derived from `x-forwarded-for` last in the fallback
  chain (`:44-48`) — behind nginx, `req.ip` needs `app.set('trust proxy', ...)` (not set in
  `index.ts`) or all clients collapse to the proxy IP.

**M3 — `saveFile` auto-creates a "temporary collaboration" for any unknown collaborationId.**
- `backend/src/services/fileService.ts:66-89` — labeled `// TEMP FIX: ... remove in production`.
  A file upload to a non-existent collaboration silently creates a `Collaboration` row owned by the
  uploader, bypassing the intended ownership model. This is dev scaffolding still live in the code
  path. Line `:110` (`allowAnyUserForDevelopment = false`) shows the auth check is intended to be
  enforced, but the temp-collaboration creation defeats it (the uploader becomes owner → passes the
  `isOwner` check).

**M4 — File download filename is not sanitized (header injection / response-splitting surface) and download authz is optional.**
- `backend/src/routes/fileRoutes.ts:124` sets `Content-Disposition: attachment; filename="${file.name}"`
  with the DB-stored original filename interpolated unescaped. A filename containing `"` or CRLF could
  break the header. Also `fileRoutes.ts` `GET /files/:fileId` only checks `canDownloadFile` **if a user
  is logged in** (`if (userId)`), so an anonymous request skips the private-collaboration check
  entirely — private files are downloadable without auth. (The route has `authenticateJWT`, which would
  normally 401 anon requests, but the code path is still logically wrong and fragile.)

**M5 — No security headers / helmet on the API; permissive-ish CORS handling.**
- `backend/src/index.ts` has no `helmet`. CORS (`:26-35`) allows a single origin from `CORS_ORIGIN`
  with `credentials:true`; acceptable, but combined with JWT-in-localStorage (frontend) there is no
  CSRF concern, yet there is also no rate limiting on auth endpoints (`/api/auth/login` has none) —
  brute-force login is unthrottled. `generalRateLimit` is defined in `rateLimit.ts:217` but **never
  applied** to any route.

**M6 — Errors and debug info leak via `console.*` and error bodies in many controllers.**
- Numerous controllers return `error.message` directly to clients (e.g. `api.ts:229`,
  `fileRoutes.ts` catch blocks, `collaborationRoutes.ts` progress handler `details: error.message`).
  There is a proper `errorHandler` (`middlewares/errorHandler.ts`) that already hides internals in
  production, but these hand-rolled `try/catch`+`res.status(500)` blocks bypass it. Also heavy
  `console.log` of user IDs and file details in `fileService.ts` / `fileRoutes.ts` (Winston `logger`
  exists and should be used instead).

**M7 — `DATABASE_URL` branch vs individual-var branch in data-source drift; prod compose sets `DB_USERNAME`/`DB_DATABASE` but entity path + cache config duplicated.**
- `backend/src/config/data-source.ts` duplicates the entire options object across the
  `DATABASE_URL ? {...} : {...}` branches (~30 lines duplicated). `cache: true` is enabled with no
  cache provider configured, and `synchronize` is env-gated correctly. Low-risk but a maintenance trap;
  the duplication means a change to one branch is easily missed in the other.

### LOW

**L1 — README/CLAUDE.md stack description is inconsistent** — README says "OpenAI integration" and
"Node v16+"; CLAUDE.md and code use Groq/Llama. `package.json` root name is `t3awanu-2`;
frontend `package.json` name is still the Vite starter default `vite-react-typescript-starter`.

**L2 — `aiSearchRateLimit` (3/day) in `rateLimit.ts:116` is dead/deprecated** — imported in `api.ts:6`
but not used (only `smartAISearchRateLimit` is wired). Remove to avoid confusion.

**L3 — `collaborationRoutes.ts` vote endpoint and others cast entities with
`as unknown as VotableEntity`** and store vote state on entities that may not have vote columns in the
consolidated schema — verify votes actually persist (potential silent no-op).

**L4 — No `.dockerignore` verification / build copies whole context** — `backend/Dockerfile` and
`frontend/Dockerfile` `COPY . .`; confirm `.dockerignore` excludes `node_modules`, `.env*`, logs.

**L5 — Backend has effectively no test coverage** — `backend/package.json` `test` is a stub. Only
`backend/src/__tests__/api.test.ts` exists and isn't run by any script.

---

## Prioritized Work Plan

> Each task is self-contained. Do them in order; C-tasks first. After each task, run the relevant
> checks in the Verification Checklist. Install dependencies first: from repo root run
> `cd backend && npm install` and `cd frontend && npm install` (node_modules is absent).

### Task 1 — Lock down role/privilege assignment on register and profile update (fixes C1, H2)
**Goal**: Users can never set `role`, `isVerified`, `isActive`, or `password` through register or the
profile-update endpoints; email changes go through a controlled path (or are disallowed here).

**Files to touch**:
- `backend/src/controllers/auth.controller.ts`
- `backend/src/routes/api.ts`

**Steps**:
1. In `auth.controller.ts` `register` (line ~14-72): stop reading `role` from `req.body`. Force
   `role: UserRole.INDIVIDUAL` for public self-registration (or ignore any client-supplied `role`).
   Keep the existing email/password validation.
2. In `api.ts` `PUT /api/users/me` (lines ~235-265): replace `userRepository.merge(user, req.body)`
   with an explicit allow-list. Only permit updating profile-safe fields:
   `firstName, lastName, bio, organization, position, location, tags, interests, profilePicture,
   allowMessages, allowConnections`. Explicitly exclude `role`, `email`, `password`, `isVerified`,
   `isActive`, `id`, `createdAt`, `updatedAt`.
3. In `api.ts` `PUT /api/users/:id` (admin, lines ~268-306): keep the admin gate, but still exclude
   `password` from a raw merge (admins should reset passwords via a hashed path, not a raw column
   write). An allow-list that may additionally include `role`/`isActive`/`isVerified` for admins is
   acceptable; `password` must never be set via raw merge.
4. Build a small shared helper (e.g. `pickAllowedFields(body, allowed)`) rather than duplicating the
   filter in two places.

**Acceptance criteria**:
- `POST /api/auth/register` with `{"role":"admin"}` in the body creates a user whose `role` is
  `individual`.
- `PUT /api/users/me` with `{"role":"admin","password":"x","isVerified":true}` changes none of those
  three fields; a legitimate `{"bio":"hi"}` still works.
- `npm run build` (backend) succeeds; no `merge(user, req.body)` remains in `api.ts`.

### Task 2 — Require a real JWT secret; remove hardcoded fallback (fixes C2)
**Goal**: The process refuses to start (or throw at token-sign time) if `JWT_SECRET` is unset; the
literal default string is deleted from the codebase.

**Files to touch**:
- `backend/src/config/passport.ts` (line 10)
- `backend/src/utils/jwt.ts` (line 6)
- `backend/src/index.ts` (startup)

**Steps**:
1. Remove the `|| 'your_jwt_secret_key_change_in_production'` fallbacks in both files.
2. In `index.ts` `startServer` (before DB init), add a guard: if `!process.env.JWT_SECRET` (and
   ideally `JWT_REFRESH_SECRET` if refresh tokens are implemented — see note below), log an error and
   `process.exit(1)`. Optionally enforce a minimum length (e.g. ≥ 32 chars).
3. Note: CLAUDE.md/compose reference `JWT_REFRESH_SECRET` but no refresh-token flow was found in code
   (`generateToken` issues a single 1d token). Do NOT invent a refresh flow in this task; just don't
   require a secret for a feature that doesn't exist unless you also implement it. Document the gap.

**Acceptance criteria**:
- Starting the backend with `JWT_SECRET` unset exits non-zero with a clear error.
- `grep -rn "your_jwt_secret_key_change_in_production" backend/src` returns nothing.

### Task 3 — Fix the CI/CD deploy to use production stack + real secrets (fixes C3, H4)
**Goal**: The GitHub Actions deploy builds and runs `docker-compose.prod.yml` with all required
secrets sourced from GitHub Actions secrets; no `POSTGRES_PASSWORD=postgres`, no dev scripts.

**Files to touch**:
- `.github/workflows/ci-cd.yml`
- (docs) `README.md`, `CLAUDE.md`, `DEPLOYMENT.md`

**Steps**:
1. Replace the `.env` heredoc (lines ~64-70) with the variables `docker-compose.prod.yml` actually
   consumes: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`,
   `OPENAI_API_KEY`, `CORS_ORIGIN`, `DB_SYNC=false`. Source every secret from
   `${{ secrets.* }}` (add the missing GitHub secrets). Never hardcode `postgres`.
2. Replace `nohup ./dev.sh --remote ...` (line ~82) and the `docker-compose.dev-remote.yml` seed call
   (line ~91) with:
   `docker compose -f docker-compose.prod.yml up -d --build` and, for seeding,
   `docker compose -f docker-compose.prod.yml exec -T backend node dist/scripts/seed-database.js`
   (guard so it only runs on first deploy — see Task 4 about seed credentials).
3. Reconcile docs: either move `dev.sh`/`prod.sh` from `Quarantine/scripts/` back to repo root, or
   update `README.md`/`CLAUDE.md` to the actual commands (`docker compose -f docker-compose.prod.yml
   up -d --build`). Pick one and make docs + CI consistent.

**Acceptance criteria**:
- The workflow file contains no literal `postgres` password and no reference to `dev.sh` or any
  `docker-compose.dev-*.yml`.
- `docker compose -f docker-compose.prod.yml config` (locally, with a filled `.env`) validates.
- The documented "how to run" command in README actually exists and works.

### Task 4 — Remove committed credentials; rotate secrets; fix seeded admin (fixes H1)
**Goal**: No usable credentials or secret files tracked in git; the seeded admin is not a
world-known password in production.

**Files to touch**:
- Remove from git: `frontend/innovator_logins.txt`, `.env.production` (keep `.env.production.template`).
- `backend/src/scripts/seed-database.ts`
- `.gitignore`

**Steps**:
1. `git rm --cached frontend/innovator_logins.txt .env.production` and add them to `.gitignore`
   (`.gitignore` already lists `.env` at line 49; add `.env.production` and `innovator_logins.txt`).
   Keep `.env.production.template` tracked.
2. In `seed-database.ts` (admin block lines ~16-28): source the admin email/password from env vars
   (e.g. `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`) and refuse to seed a default admin when
   `NODE_ENV === 'production'` unless those are set. Keep the demo users behind a `--demo` flag or
   `SEED_DEMO=true` guard so production doesn't get `Password123!` accounts.
3. Rotate `JWT_SECRET` and the Groq/OpenAI key on the server (out-of-band; note in DEPLOYMENT.md that
   any previously committed secret must be considered compromised — a real `JWT_SECRET` existed in git
   history around commit `5c1554f`).

**Acceptance criteria**:
- `git ls-files | grep -E 'innovator_logins|\.env\.production$'` returns nothing.
- Running the seed with `NODE_ENV=production` and no `SEED_ADMIN_PASSWORD` does not create an admin
  with a hardcoded password.

### Task 5 — Make AI search scale: use the Postgres full-text path, bound the in-memory scorer (fixes H3, H5)
**Goal**: AI search does not load entire tables into memory unbounded, and degrades gracefully +
observably when the Groq key is missing.

**Files to touch**:
- `backend/src/services/ai-search.service.ts`
- `backend/src/services/database-search.service.ts`
- `backend/src/migrations/AddSearchIndexes.sql` (ensure applied)
- `backend/src/routes/api.ts` (search response metadata)

**Steps**:
1. Decide the architecture and make it real (don't leave dead code):
   - **Preferred**: wire `databaseSearch()` from `database-search.service.ts` as the primary search
     (it uses Postgres full-text on the `v_searchable_content` view). Use the Groq step only to expand
     the query string (synonyms) that you feed into `to_tsquery`. Ensure `AddSearchIndexes.sql` is run
     as a migration (currently a loose `.sql` file — convert it into a TypeORM migration or run it in
     `run-migrations.ts`), so the view + GIN indexes exist in prod.
   - **If keeping the in-memory scorer**: add `LIMIT` + a `WHERE` pre-filter (e.g. ILIKE on the raw
     query) to each `getMany()` at `ai-search.service.ts:187-215` so you never load full tables.
2. In `processQueryWithAI` (lines ~114-178): when `process.env.OPENAI_API_KEY` is missing or clearly a
   placeholder (`startsWith('sk-placeholder')`), skip the Groq call entirely and set a flag
   `aiDegraded = true`. Propagate it so `api.ts` search metadata reports
   `searchEnhancements.intentDetection` honestly (false when degraded) instead of hardcoded `true`
   (`api.ts:349-355`).
3. Remove the unused `aiSearchRateLimit` import in `api.ts:6` and its definition (`rateLimit.ts:116`)
   if not needed (L2).

**Acceptance criteria**:
- A search request with thousands of seeded rows does not load every row into JS (verify via query
  logs or by asserting a `LIMIT`/full-text query is issued).
- With `OPENAI_API_KEY` unset, `/api/ai-search?q=test` returns results (from DB/fallback) and the
  response `meta.searchEnhancements.intentDetection === false`.
- No dead `database-search.service.ts` (it is either imported/used or removed).

### Task 6 — Fix the middleware timeout double-`next()` race (fixes M1)
**Goal**: `authenticateJWT` and `optionalAuthentication` call `next()` exactly once.

**Files to touch**: `backend/src/middlewares/auth.ts` (lines 16-33 and 91-114).

**Steps**: Remove the `setTimeout`-based fallback entirely (JWT verify is fast and DB-bound; if the DB
hangs, the request should hang and be handled by connection timeouts, not by silently continuing
unauthenticated). If a timeout is genuinely wanted, guard with a `let settled = false;` flag set in
both the timeout and the passport callback, and no-op the second caller.

**Acceptance criteria**: No `setTimeout` remains in `auth.ts`; a slow/valid token still authenticates;
concurrent-path tests don't produce "Cannot set headers after they are sent".

### Task 7 — Throttle auth endpoints & apply the existing general rate limiter (fixes M5)
**Goal**: Brute-force protection on login; security headers present.

**Files to touch**: `backend/src/index.ts`, `backend/src/routes/auth.routes.ts`, `backend/package.json`.

**Steps**:
1. Add `helmet` (`npm i helmet` in backend) and `app.use(helmet())` in `index.ts` after `cors`.
2. Apply a rate limiter to `/api/auth/login` (and `/register`) — reuse `createRateLimit` from
   `rateLimit.ts` (e.g. 10 attempts / 15 min per IP). Wire `generalRateLimit` (defined at
   `rateLimit.ts:217` but never used) onto the main `/api` router or remove it.
3. Add `app.set('trust proxy', 1)` in `index.ts` so `req.ip` is the real client behind nginx (needed
   for rate-limit keys to work — see M2).

**Acceptance criteria**: Repeated failed logins from one IP get 429 after the threshold; response
carries helmet headers; `req.ip` reflects `X-Forwarded-For`.

### Task 8 — Remove dev-only file-upload scaffolding & harden download (fixes M3, M4)
**Goal**: File uploads require a real, owned/authorized collaboration; downloads always enforce authz;
filenames are safe in headers.

**Files to touch**: `backend/src/services/fileService.ts`, `backend/src/routes/fileRoutes.ts`.

**Steps**:
1. In `fileService.saveFile` (lines ~66-89) remove the "TEMP FIX" block that auto-creates a temporary
   collaboration. If the collaboration doesn't exist, throw a not-found error.
2. In `fileRoutes.ts` `GET /files/:fileId` (lines ~100-135): make the `canDownloadFile` authz check
   unconditional (remove the `if (userId)` gate) — the route already has `authenticateJWT` so `userId`
   should always be present; enforce it.
3. Sanitize the `Content-Disposition` filename at `fileRoutes.ts:124` — strip CR/LF and quotes, or use
   RFC 5987 `filename*=UTF-8''<encoded>`.

**Acceptance criteria**: Upload to a nonexistent collaboration returns 404 (no ghost collaboration
created); an unauthorized user cannot download a private file; a file named `"; drop\r\nX: y` does not
corrupt response headers.

### Task 9 — Route hand-rolled errors through the central error handler; replace `console.*` with logger (fixes M6)
**Goal**: No `error.message`/stack leaks to clients in production; structured logging.

**Files to touch**: controllers/routes that catch and `res.status(500).json({error: error.message})`
(notably `backend/src/routes/api.ts:224-231`, `backend/src/routes/fileRoutes.ts` catch blocks,
`backend/src/routes/collaborationRoutes.ts` progress handler), plus `fileService.ts`/`fileRoutes.ts`
`console.log` calls.

**Steps**: Prefer letting the `asyncHandler`/`routeHandler` wrappers forward errors to
`errorHandler` (throw `AppError` instead of catching-and-responding). Replace `console.log`/`console.error`
with the Winston `logger` (`backend/src/utils/logger.ts`). Do not return raw `error.message` to clients.

**Acceptance criteria**: In `NODE_ENV=production`, a thrown internal error returns the generic
"Something went wrong" body from `errorHandler`, not `error.message`; `grep -rn "console\." backend/src`
is materially reduced (ideally zero in request paths).

### Task 10 — Add a Redis-backed (or clearly single-instance-documented) rate limiter (addresses M2)
**Goal**: Rate limiting survives restarts and is correct behind the proxy.
**Files**: `backend/src/middlewares/rateLimit.ts`, compose.
**Steps**: Either (a) document explicitly that the backend must run as a single replica and accept
reset-on-restart, or (b) back the store with Redis (add a `redis` service to
`docker-compose.prod.yml`, use `ioredis`). Ensure keys use the trusted client IP (depends on Task 7's
`trust proxy`). **Lower priority** — do after Tasks 1-9.

**Acceptance criteria**: If Redis chosen, limits persist across a backend container restart.

### Task 11 — Documentation & metadata cleanup (fixes L1, L4, L5)
**Files**: `README.md`, `CLAUDE.md`, `frontend/package.json`, root `package.json`, `.dockerignore`
files, `backend/package.json` test script.
**Steps**: Fix README stack description (Groq not OpenAI; Node 20 per Dockerfiles). Rename the Vite
starter `name` in `frontend/package.json`. Verify/create `.dockerignore` in `backend/` and `frontend/`
excluding `node_modules`, `.env*`, `logs`, `dist`. Replace the backend stub `test` script with a real
runner (e.g. `jest` or `vitest`) and wire `backend/src/__tests__/api.test.ts`. Add at least smoke
tests for Tasks 1, 2, 8 fixes.

**Acceptance criteria**: `npm test` (backend) runs a real suite; README commands match reality.

---

## Out of Scope / Deliberate Non-Goals
- **Do not implement a refresh-token flow** just because `JWT_REFRESH_SECRET` is referenced — no such
  flow exists in code. Only add it if explicitly requested (and then update Task 2).
- **Do not rewrite the frontend** or restyle UI; findings here are backend/security/deploy-focused.
- **Do not delete `Quarantine/`** wholesale — it is an intentional holding area; only reconcile the
  specific scripts/compose files referenced by live docs/CI (Task 3/H4).
- **Do not migrate the DB schema naming** (snake_case columns vs camelCase entities). It is handled via
  explicit `name:` mappings (e.g. `Partnership.ts:41` `initiator_id`, `Challenge.ts:53`
  `created_by_id`) and the consolidated migration. Leave it unless a task requires touching it.
- **Do not change the AI model/provider** (Groq/Llama) — only make its absence graceful (Task 5).
- **Do not add analytics, i18n, PWA, or new product features** — this spec is remediation, not growth.
- **Do not commit or push** anything; do not modify files outside those named per task without cause.

---

## Verification Checklist
Run from repo root unless noted. Install deps first (node_modules is absent):
```bash
cd backend && npm install && cd ../frontend && npm install && cd ..
```

Per-area checks:
```bash
# Backend typecheck / build (compiles TS -> dist)
cd backend && npm run build && cd ..

# Backend lint
cd backend && npm run lint && cd ..

# Frontend typecheck + build
cd frontend && npm run build && cd ..

# Frontend lint + tests
cd frontend && npm run lint && npm test && cd ..

# Backend tests (after Task 11 makes this real)
cd backend && npm test && cd ..

# Security greps — all should return NOTHING after fixes:
grep -rn "your_jwt_secret_key_change_in_production" backend/src
grep -n "merge(user, req.body)" backend/src/routes/api.ts
git ls-files | grep -E 'innovator_logins|\.env\.production$'
grep -rn "POSTGRES_PASSWORD=postgres" .github/workflows/ci-cd.yml
grep -rn "dev.sh\|docker-compose.dev" .github/workflows/ci-cd.yml
grep -n "TEMP FIX" backend/src/services/fileService.ts
grep -n "setTimeout" backend/src/middlewares/auth.ts

# Compose validates with a filled .env.production:
docker compose -f docker-compose.prod.yml config >/dev/null && echo OK

# Manual API smoke (backend running locally):
#  - Register with {"role":"admin"} -> resulting user.role == "individual"
#  - PUT /api/users/me {"role":"admin","password":"x"} -> role/password unchanged
#  - Start backend with JWT_SECRET unset -> process exits non-zero
#  - GET /api/ai-search?q=test with OPENAI_API_KEY unset -> 200, meta.intentDetection=false
#  - Repeated bad logins -> 429 after threshold
```

---
*End of spec. Line numbers reference the repository state at analysis time (branch `main`,
HEAD `be669f3`); re-confirm before editing if the tree has moved.*
