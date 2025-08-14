# 📝 TodoPro — Professional Task Manager

Production-ready, full‑stack task manager built with Next.js 15 (App Router), Prisma, and Neon/PostgreSQL. Designed for speed, elegance, and productivity — with tag‑based organization, smart filters, due date tracking, and a sleek dark UI.

## ✨ Features

- Add, edit, complete, delete todos
- Tag-based organization and inline tag entry
- Priority flags (important) and due dates
- Smart quick filters: Today, Due Soon, Important
- URL-synced search and filters using nuqs
- Advanced search syntax: `@tag:work`, `/date:today`, `@important:true`, `@completed:false`
- Virtualized list rendering for large datasets
- Optimistic UX via React Query mutations
- Responsive design; mobile off‑canvas sidebar
- Modern UI with shadcn/ui, Tailwind v4, glass/gradient polish

## 🧰 Tech Stack

- Framework: Next.js 15 (App Router)
- Styling: Tailwind CSS v4, shadcn/ui
- Animations: Framer Motion, GSAP
- Data: Prisma ORM + Neon/PostgreSQL
- Client State: Zustand
- Server/Client Fetching: TanStack Query (React Query)
- Utilities: Zod, nuqs, lucide-react

## 📦 Monorepo/Project Structure

```
src/
  app/                 # App Router routes, layout, API
  components/          # UI and global components
  hooks/               # Reusable hooks (e.g., use-todos)
  lib/                 # Server utilities (prisma, parsing, errors)
  store/               # Zustand UI store
prisma/                # Prisma schema and migrations
public/                # Static assets
```

## 🚀 Getting Started

1) Install dependencies

```bash
npm ci
```

2) Create environment file

```bash
cp .env.example .env
```

3) Set up the database

```bash
npx prisma migrate deploy
```

4) Run the dev server

```bash
npm run dev
```

Visit http://localhost:3000

## 🔐 Environment Variables

See `.env.example` for all variables. Required:

- DATABASE_URL: PostgreSQL connection string (e.g., Neon)
- NEXT_PUBLIC_SITE_URL: Your production URL

## 🧪 Scripts

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Lint
npm run type-check # TypeScript type checking
```

## 📤 Deployment

- Recommended: Deploy on Vercel
- Ensure `DATABASE_URL` is configured in project env
- Run `prisma migrate deploy` during build or via a CI step
- See `docs/DEPLOYMENT.md` for details

## 🧭 Architecture Notes

- API backed by Next.js Route Handlers (`src/app/api/todos`)
- Strict schema validation on input (Zod)
- Search query parsed server-side for robust filtering
- URL-synced filters/search via nuqs; server honors `q`, `completed`, `important`

## 🤝 Contributing

Please read `CONTRIBUTING.md` and open an issue/PR. Feature and bug templates are provided.

## 🛡️ Security

See `SECURITY.md` for reporting guidelines.

## 📜 License

MIT — see `LICENSE`.

---

Built with ❤️ by BlueHorizon7. Repository: https://github.com/BlueHorizon7/TodoPro


