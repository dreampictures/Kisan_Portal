# Kisan Union Punjab Membership Portal

A membership management system for Kisan Union Punjab featuring multi-stage approval workflow, ID card generation with QR codes, and photo upload via Cloudflare R2.

## Stack
- **Frontend**: React + Vite, TypeScript, Tailwind CSS, Radix UI, Framer Motion, TanStack Query
- **Backend**: Express + TypeScript (tsx)
- **Database**: PostgreSQL via Drizzle ORM (Replit managed)
- **Storage**: Cloudflare R2 (S3-compatible) for member photos
- **Auth**: Passport.js (local strategy) + session-based admin auth

## Running the app
```bash
npm run dev
```
Serves on port 5000. The workflow `Start application` handles this automatically.

## Database
Schema is in `shared/schema.ts`. To push schema changes:
```bash
npm run db:push
```

## Environment Secrets (all set)
- `SESSION_SECRET` — express-session secret
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_PIN` — admin login credentials
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` — Cloudflare R2 storage

## Key files
- `server/index.ts` — Express server entry point
- `client/src/main.tsx` — React entry point
- `shared/schema.ts` — Database schema (Drizzle)
- `drizzle.config.ts` — Drizzle config

## User preferences
- Communicates in Punjabi
