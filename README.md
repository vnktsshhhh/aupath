# Yuki AI – Australian AI Job Assistant

An AI-powered job search platform built for the Australian market. Upload your resume, get AI job matching, generate tailored cover letters, and track every application.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Auth & Storage**: Supabase (Auth, Postgres, Storage)
- **ORM**: Prisma
- **AI**: OpenRouter (Claude Haiku / Claude 3.5 Sonnet)
- **Resume parsing**: pdf-parse (PDF), mammoth (DOCX)
- **Validation**: Zod
- **Forms**: React Hook Form

## Features

- Email/password auth with Supabase
- Guided onboarding with resume upload
- AI profile extraction from PDF/DOCX resumes
- Job search with filters (state, work type, employment type, experience level, industry, salary, visa sponsorship)
- AI fit score with explainable strengths and gaps
- AI cover letter generation in Australian English
- AI tailored resume bullet generation
- Save jobs / bookmark
- Kanban job tracker (Wishlist → Applied → Interview → Offer)
- Company directory with open positions
- Admin CSV job importer
- 100 seed jobs across 20 real Australian companies

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd aupath
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API |
| `DATABASE_URL` | Supabase project → Settings → Database → Connection String (Transaction pooler) |
| `DIRECT_URL` | Supabase project → Settings → Database → Connection String (Direct) |
| `OPENROUTER_API_KEY` | openrouter.ai → Keys |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for dev |

### 3. Supabase setup

In your Supabase project:

1. **Auth** → Email provider enabled (default)
2. **Auth** → URL Configuration → Site URL: `http://localhost:3000`
3. **Auth** → URL Configuration → Redirect URLs: `http://localhost:3000/auth/callback`
4. **Storage** → Create bucket named `resumes` (public or private with appropriate policy)

### 4. Database setup

```bash
npm run db:generate    # generate Prisma client
npm run db:push        # push schema to Supabase
npm run db:seed        # seed 100 Australian jobs
```

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## CSV Import Format

Upload at `/admin/import` (requires `isAdmin: true` on the user record).

```
title,company,location,state,workType,employmentType,salaryMin,salaryMax,description,requirements,responsibilities,skills,industry,experienceLevel,visaSponsorship,workRights,isFeatured
```

- **workType**: `on-site` | `hybrid` | `remote`
- **employmentType**: `full-time` | `part-time` | `contract` | `casual`
- **experienceLevel**: `graduate` | `junior` | `mid` | `senior` | `lead`
- **requirements / responsibilities**: pipe `|` separated
- **skills / workRights**: comma `,` separated

Download the template from the admin import page.

## Making a user admin

In Supabase SQL editor or Prisma Studio:

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your@email.com';
```

## Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env.example`
4. Add `postinstall` script for Prisma client generation:

```json
"postinstall": "prisma generate"
```

5. Deploy — Vercel will run `next build` automatically

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup pages
│   ├── (dashboard)/     # Protected pages (jobs, tracker, profile, etc.)
│   ├── (admin)/         # Admin import page
│   ├── api/             # Route handlers (resume, AI, tracker, jobs)
│   ├── auth/callback/   # Supabase auth callback
│   ├── layout.tsx
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # Button, Input, Card, Badge, Modal, Toast
│   ├── layout/          # Sidebar
│   ├── jobs/            # JobCard, JobFilters
│   ├── resume/          # UploadZone
│   └── tracker/         # KanbanBoard
├── lib/
│   ├── supabase/        # Browser + server Supabase clients
│   ├── prisma.ts        # Prisma singleton
│   ├── openrouter.ts    # AI functions (match, cover letter, bullets, extraction)
│   ├── resume-parser.ts # PDF/DOCX text extraction
│   └── utils.ts         # Helpers, AU constants
├── server/
│   └── actions/         # Server actions (auth, profile, tracker)
├── types/               # Shared TypeScript types
└── middleware.ts        # Auth route protection
prisma/
├── schema.prisma        # Database schema
└── seed.ts              # 100 AU jobs across 20 companies
```

## AI Models (OpenRouter)

Configured in `src/lib/openrouter.ts`:

- **Fast tasks** (match scoring, resume bullets): `anthropic/claude-3-haiku`
- **Quality tasks** (cover letters, profile extraction): `anthropic/claude-3.5-sonnet`

Change the model constants to use any OpenRouter-supported model.

## Disclaimer

AuPath is a demonstration MVP. Seed data uses publicly known Australian company names for realism but all job listings are fictional. Not affiliated with any employer. Not for commercial use without review.
