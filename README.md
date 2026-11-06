# REVERSE

A collaborative marketplace that starts with what you need — borrow, get, swap, or exchange a skill.

## Setup

```bash
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

All demo profiles use password `reverse123`:

- sofia@reverse.demo
- karim@reverse.demo
- leila@reverse.demo
- nabil@reverse.demo

Demo records are stored with `isDemo: true` so they stay distinguishable from real signups.

## Configuration

Copy `.env.example` to `.env` if needed:

- `DATABASE_URL` — SQLite file, default `file:./dev.db`
- `SESSION_SECRET` — change this in any shared environment

No external API keys are required. Images can be uploaded locally to `/public/uploads`.

## Stack

Next.js, TypeScript, Tailwind CSS, Prisma, SQLite.
