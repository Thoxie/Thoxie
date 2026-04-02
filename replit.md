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
- **Theme**: Navy (`hsl(220 60% 25%)`) + Gold (`hsl(40 95% 55%)`) + Orange CTA (`hsl(18 90% 55%)`) + Mint background (`hsl(160 30% 95%)`)

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

- **cases** — User's small claims cases with plaintiff/defendant info, claim details, intake progress, demand/venue info, eligibility flags
  - New fields: `demandDescription`, `incidentDateStart`, `incidentDateEnd`, `venueBasis`, `suingPublicEntity`, `disputeAttorneyFees`, `filedOver12`, `filedOver2500`
- **documents** — File uploads attached to cases

## API Endpoints

- `GET /api/healthz` — Health check
- `GET/POST /api/cases` — List/create cases (auth required)
- `GET/PUT/DELETE /api/cases/:id` — Case CRUD (auth required, body sanitized — userId/id/createdAt stripped)
- `PUT /api/cases/:id/intake` — Save intake wizard progress (auth required, body sanitized)
- `POST /api/cases/:id/demand-letter` — Generate demand letter (auth required)
- `GET/POST /api/cases/:id/documents` — List/upload documents (auth required)
- `DELETE /api/cases/:id/documents/:docId` — Delete document (auth required)
- `GET /api/dashboard` — Dashboard summary (auth required)
- `POST /api/ai/ask` — AI assistant Q&A (auth required)

## Frontend Pages

- `/` — Landing page (public) / redirects to dashboard if signed in
- `/how-it-works` — How it works guide (public)
- `/types-of-cases` — Types of small claims cases (public)
- `/faq` — 21 Q&A frequently asked questions (public)
- `/resources` — Court information and resources (public)
- `/start-case` — Create new case form (auth required)
- `/dashboard` — Case management dashboard (auth required)
- `/cases/:id` — Case detail with 5 tabs: Intake, Documents, Ask The Genie AI, Demand Letter, Forms
- `/sign-in`, `/sign-up` — Clerk authentication

## Case Detail Page

- **Header**: Back link "← Your Cases", case title, "Intake Complete" badge, claim amount
- **5 Tabs**: Intake | Documents | Ask The Genie AI | Demand Letter | Forms
- Navy active tab styling, white card containers

## 4-Step Intake Wizard

1. **Parties**: Plaintiff info (name, address, phone, email) + Defendant info + County/Courthouse selection
2. **Claim Details**: Claim type dropdown, amount, date range, what happened textarea, calculation textarea
3. **Prior Demand & Venue**: Prior demand yes/no + description, venue basis radio buttons (4 options)
4. **Eligibility & Review**: 4 eligibility checkboxes + full case summary review panel

## Courthouse Data

- `src/data/courthouses.ts` — Maps all 58 California counties to courthouse names and addresses
- Counties with multiple courthouses (e.g., Los Angeles has 11, San Diego has 4) show dropdown selection
- Courthouse data displayed in step 4 review panel

## Key Features

1. **4-Step Intake Wizard**: Parties → Claim Details → Prior Demand & Venue → Eligibility & Review
2. **Demand Letter Generator**: Auto-generates professional demand letters from case data
3. **Document Upload**: Drag-and-drop file upload with status badges and file details
4. **Ask the Genie AI**: Embedded chat for small claims questions (full tab view)
5. **Court Information**: Filing fees, process steps, links to CA courts website
6. **Official Forms Links**: SC-100, SC-101, SC-104, SC-120, FW-001

## Commands

- `pnpm run typecheck` — Full type check
- `pnpm --filter @workspace/api-spec codegen` — Regenerate API client from OpenAPI spec
- `pnpm --filter @workspace/db run push` — Push schema changes to database
