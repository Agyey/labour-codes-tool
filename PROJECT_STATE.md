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

## Current Architecture
- **State Management**: Decoupled `DataContext` (Entity state), `UIContext` (Ephemeral UI state), and `FilterContext` (Search/Filtering).
- **Component Strategy**: Atomic Architecture. Monolithic components (`ProvisionCard`, `AppShell`, `EditorModal`) have been decomposed into focused sub-components.
- **Performance**: Lazy loading of heavy views via `next/dynamic`. Optimized re-renders through context splitting.

## Mapping Current Features
| Feature | Status | Quality |
|---------|--------|---------|
| Next.js 14 Upgrade | [x] Completed | High |
| Context Splitting | [x] Completed | High |
| Provision CRUD | [x] Completed (Editor & Transactions) | High |
| State-wise Tracking | [x] Integrated in Editor | High |
| Compliance Workflow | [x] Basic Task Management | Medium |
| Search & Filtering | [x] Global & Local | High |
| Observability | [x] Structured Logging | Medium |
| Deployment Config | [x] `railway.json` & `.env.example` added | High |
| Accessibility | [x] ARIA Markers implemented | High |
| Performance | [x] Next/Image & Hook Optimization | High |
| Dashboard Revamp | [x] Glassmorphism & Modern Metrics | High |
| PDF Generation | [x] High-fidelity Documents | High |
| Theme Consistency | [x] Zinc-950 Dark Mode | High |
| Vectorless RAG Parser| [x] Python Engine + Auto-Population | High |


## Technical Debt & Gaps
- **Type Safety**: Some explicit `any` casts remain in complex Prisma-to-Client transformations (e.g., recursive comment structures).
- **Statelessness Audit**: Ensure no local disk persistence is used (all state in Postgres/Redis).

## Standards Alignment Roadmap
1. [x] **Infrastructure Hardening**: Added `railway.json` and `.env.example`.
2. [x] **Transactional Integrity**: Implemented `prisma.$transaction` in provision updates.
3. [x] **UX Polish**: Added loading states and prevents double-submissions.
4. [x] **Accessibility**: Added ARIA labels to interactive elements.
5. [x] **Build Compliance**: 100% ESLint compliance reached and verified with Railway.
6. [x] **Data Integrity**: Standardized snake_case (Prisma) to camelCase (Frontend) mappings.
7. [x] **Infrastructure Hardening**: Resolved Prisma engine breakage on Alpine/Railway via `binaryTargets` and custom Docker layers.
8. [x] **UI Polish**: High-fidelity transformation with Zinc-based (`zinc-950`) dark mode and fixed Reader/Editor toggle logic.
9. [x] **Dashboard Revamp**: Modernized Executive Dashboard with premium glassmorphism and refined repository buttons.
10. [x] **PDF Service**: Implemented high-fidelity client-side PDF generation with integrated preview and ink-friendly capture.
11. [x] **Vectorless RAG Auto-Population (Knowledge & Compliance)**: Deployed Python backend with LLM structural tree parsing, automatically pushing into Prisma DB models.
12. [ ] **Statelessness Audit**: Audit server actions for disk writes.
13. [ ] **Type Hardening**: Refine recursive types for comments.
14. [x] **Deployment Fix**: Fixed Docker build failing on Prisma Python client generation for Railway.
