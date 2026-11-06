# REVERSE

A collaborative marketplace that starts with what you need — borrow, get, swap, or exchange a skill.

## Setup (local)

You need a **PostgreSQL** database (Neon is free and works with Vercel).

1. Create a project on [neon.tech](https://neon.tech).
2. Copy `.env.example` to `.env` and paste:
   - `DATABASE_URL` — pooled connection string
   - `DIRECT_URL` — direct connection string (Neon shows both)
   - `SESSION_SECRET` — any long random string
3. Install and seed:

```bash
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub (already at `reverse-marketplace` if you used that remote).
2. In Vercel: **Add New Project** → import the GitHub repo.
3. Add these Environment Variables (Production + Preview):
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `SESSION_SECRET`
   - optional: `BLOB_READ_WRITE_TOKEN` (Vercel Storage → Blob)
4. Deploy. The build runs `prisma migrate deploy` then `next build`.
5. After the first successful deploy, seed demo users once from your machine:

```bash
npx prisma db seed
```

Use the same `DATABASE_URL` as Vercel so the seed writes to the production database.

## Demo accounts

Password: `reverse123`

- sofia@reverse.demo
- karim@reverse.demo
- leila@reverse.demo
- nabil@reverse.demo

Demo rows are marked `isDemo: true`.

## Stack

Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL.
