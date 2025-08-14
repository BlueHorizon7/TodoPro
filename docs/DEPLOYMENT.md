# Deployment

## Vercel (Recommended)

1. Create a new Vercel project and import this repository.
2. Add environment variables:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SITE_URL`
3. Build & Output Settings: default.
4. Run Prisma migrations during build or via CI: `npx prisma migrate deploy`.
5. Use Neon/PostgreSQL for the database and set `DATABASE_URL`.

## Self-Hosted

1. Build: `npm run build`
2. Migrate: `npx prisma migrate deploy`
3. Start: `npm run start`
4. Ensure `DATABASE_URL` is set in the environment.
