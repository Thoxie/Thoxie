# Small Claims Genie Workspace

## Overview

pnpm workspace monorepo. A guided legal form assistant for California Small Claims Court (SC-100 Plaintiff's Claim form) with Clerk authentication.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4
- **Auth**: Clerk (whitelabel, proxy-based)
- **Routing**: Wouter
- **UI Components**: shadcn/ui (Radix primitives)
- **Font**: Plus Jakarta Sans
- **Theme**: Navy (#1e293b) + Gold (#eab308) palette

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/            # Express API server (port 8080)
│   ├── small-claims-genie/    # React+Vite frontend (port 18304)
│   └── mockup-sandbox/        # Design preview server
├── lib/
│   ├── api-spec/              # OpenAPI spec + Orval codegen config
│   ├── api-client-react/      # Generated React Query hooks
│   ├── api-zod/               # Generated Zod schemas from OpenAPI
│   └── db/                    # Drizzle ORM schema + DB connection
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- **cases** — User's small claims cases with plaintiff/defendant info, claim details, intake progress
- **documents** — File uploads attached to cases

## API Endpoints

- `GET /api/healthz` — Health check
- `GET/POST /api/cases` — List/create cases (auth required)
- `GET/PUT/DELETE /api/cases/:id` — Case CRUD (auth required)
- `PUT /api/cases/:id/intake` — Save intake wizard progress (auth required)
- `POST /api/cases/:id/demand-letter` — Generate demand letter (auth required)
- `GET/POST /api/cases/:id/documents` — List/upload documents (auth required)
- `DELETE /api/cases/:id/documents/:docId` — Delete document (auth required)
- `GET /api/dashboard` — Dashboard summary (auth required)
- `POST /api/ai/ask` — AI assistant Q&A (auth required)

## Frontend Pages

- `/` — Landing page (public) / redirects to dashboard if signed in
- `/dashboard` — Case management dashboard (auth required)
- `/cases/:id` — Case detail with tabs: Intake, Documents, Demand Letter, Forms
- `/court` — Court information (public)
- `/faq` — Frequently asked questions (public)
- `/contact` — Contact page (public)
- `/disclaimers` — Legal disclaimers (public)
- `/sign-in`, `/sign-up` — Clerk authentication

## Key Features

1. **7-Step Intake Wizard**: Plaintiff info → Defendant info → Claim type → Amount → Demand made → County/Court → Review
2. **Demand Letter Generator**: Auto-generates professional demand letters from case data
3. **Document Upload**: Attach evidence files to cases
4. **Ask the Genie AI**: FAQ-based assistant for common small claims questions
5. **Court Information**: Filing fees, process steps, links to CA courts website
6. **Official Forms Links**: SC-100, SC-101, SC-104, SC-120, FW-001

## Commands

- `pnpm run typecheck` — Full type check
- `pnpm --filter @workspace/api-spec codegen` — Regenerate API client from OpenAPI spec
- `pnpm --filter @workspace/db run push` — Push schema changes to database
