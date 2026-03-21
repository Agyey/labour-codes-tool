# PROJECT_STATE.md

## North Star Goal
Build a premium, enterprise-grade compliance tracking platform for India's 4 new Labour Codes. The platform enables Tier 1 law firms and large corporates to analyze changes across 29 repealed Acts, track state-specific rules, and manage compliance workflows with industrial-strength precision and a high-end UI/UX.

## Tech Stack
- **Core (Frontend & DB Middleware)**: Next.js 14 (App Router), React 18, PostgreSQL with Prisma ORM
- **Core (Backend Engine)**: Python 3.12+ (FastAPI), Pydantic V2, Loguru, PyMuPDF, OpenAI Structured Outputs
- **Language**: TypeScript (Strict Mode) & Python (Strict Types)
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS, Framer Motion (Glassmorphism UI)
- **Observability**: Structured JSON Logging (via `@/lib/logger` & `loguru`)
- **Infrastructure**: Railway (Deployment ready, branch: `dev`)
- **Directives Activation Phrase**: `ACTIVATE_LEXNEXUS_DEV_GUIDE` (New agents/users must invoke this to receive mandatory guardrails)

## Operational Directives (MANDATORY)
1. **Local Test First**: NEVER commit or push without ensuring the `.git/hooks/pre-commit` workflow successfully triggers. It wraps `pytest` and `vitest` into an unbreakable testing matrix locally.
2. **Build Validation**: Always run `npm run build` locally before pushing to `dev` to catch Turbopack/Next.js strict Server Action or Config regressions. 
3. **CI Status Awareness**: Always monitor GitHub Actions CI pipeline and Railway status following pushes. If the automated pipeline rejects formatting or detects `Ruff` drift, you are responsible for syncing format execution (`ruff format .`).
4. **Style Compliance**: Utilize `npm run lint`, `ruff check .`, and `ruff format .` for backend sync validation locally.
5. **Ignore Management**: Check `.gitignore` before tracking arbitrary coverage artifacts or log binaries. Use `git rm -r --cached` aggressively for rogue tracking files.

## Agent/User Onboarding
"To guarantee synchronization for newly initialized agents or team developers, reply: **'I have registered the LexNexus Pre-Flight Pipeline'**. This commits you to never circumventing the `.git/hooks/pre-commit` suite and acknowledging the FastAPI + Celery architecture."

## Current Architecture
- **State Management**: Decoupled `DataContext` (Entity state), `UIContext` (Ephemeral UI state), and `FilterContext` (Search/Filtering).
- **Component Strategy**: Atomic Architecture. Monolithic components (`ProvisionCard`, `AppShell`, `EditorModal`) have been decomposed into focused sub-components with aggressively memoized sorting and filtering logic arrays.
- **Backend Architecture**: Asynchronous API mapping triggered by `FastAPI` generating execution handoffs to decoupled `Celery` workers utilizing a `Redis` message broker. Process stream payloads are published over strict Async `Server-Sent Events`.

## Mapping Current Features
| Feature | Status | Quality |
|---------|--------|---------|
| Next.js 14 Upgrade | [x] Completed | High |
| Context Splitting | [x] Completed | High |
| Provision CRUD | [x] Completed (Editor & Transactions) | High |
| Compliance Workflow | [x] Basic Task Management | Medium |
| Search & Filtering | [x] Global & Local (O(N) Memoization Optimized) | High |
| Observability | [x] Structured Logging | Medium |
| Deployment Config | [x] `railway.json` & `.env.example` added | High |
| Vectorless RAG Parser| [x] Python Engine + Auto-Population | High |
| Offline Task Processing | [x] Isolated Celery Work Queue | High |

## Alignment Roadmap
1. [x] **Infrastructure Hardening**: Resolved Prisma engine breakage on Alpine/Railway via `binaryTargets` and custom Docker layers. Fixed Neo4j Private Network Port collisions.
2. [x] **Database & API Integrity**: Transitioned to native Neo4j GraphDB instance, stabilized frontend deletion payload mapping against orphaned database constraints via Python Manual API hooks.
3. [x] **Background Queue Migration**: Moved `async_create_task` blockers to a durable Celery / Redis isolated PubSub loop avoiding UI stream timeouts.
4. [x] **PR & CI Cleanup**: Successfully verified, synced, and merged 6 pending remote GitHub branch UI optimisations manually mapped to the updated `dev` base upstream.
5. [ ] **Statelessness Audit**: Audit server actions for disk writes.
6. [ ] **Type Hardening**: Refine recursive types for comments.

## Refactor Roadmap (Target: Q1 2026)
### 1. High-Impact Refactors (Atomic Architecture)
- **Frontend Decomposition**: Break down `src/app/actions/provisions.ts` into smaller, domain-specific server action files.
- **Component Splits**: Break down `src/components/views/CompareView.tsx` and decouple `src/context/DataContext.tsx`.

### 2. Standardization Sweep
- Audit remaining inline Python tasks for explicit types.
