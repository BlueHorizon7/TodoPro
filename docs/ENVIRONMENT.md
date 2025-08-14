# Environment Setup

1. Copy `.env.example` to `.env` (create `.env.example` if missing):
   - `DATABASE_URL` — Neon/Postgres connection string
   - `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` in dev or your production URL
2. Apply database migrations:
   - `npx prisma migrate deploy`
3. Start development:
   - `npm run dev`
