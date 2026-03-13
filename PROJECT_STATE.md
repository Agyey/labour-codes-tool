# PROJECT_STATE.md

## North Star Goal
Build a premium, enterprise-grade compliance tracking platform for India's 4 new Labour Codes. The platform enables Tier 1 law firms and large corporates to analyze changes across 29 repealed Acts, track state-specific rules, and manage compliance workflows with industrial-strength precision and a high-end UI/UX.

## Tech Stack
- **Core**: Next.js 14 (App Router), React 18
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS, Framer Motion (Glassmorphism UI)
- **Observability**: Structured JSON Logging (via `@/lib/logger`)
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
7. [ ] **Statelessness Audit**: Audit server actions for disk writes.
8. [ ] **Type Hardening**: Refine recursive types for comments.
