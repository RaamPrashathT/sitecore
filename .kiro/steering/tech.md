# Tech Stack

## Architecture

Monorepo with two separate apps:
- `client/` — React SPA
- `server/` — Node.js REST API

---

## Client

| Concern | Library |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 (SWC plugin) |
| Language | TypeScript 5 (strict mode) |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| HTTP | Axios (singleton at `client/src/lib/axios.ts`) |
| Forms | React Hook Form + Zod |
| UI components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v4 |
| Icons | Tabler Icons, Lucide React |
| Maps | React Leaflet |
| Date utils | date-fns |

**Path alias:** `@/` maps to `client/src/`

---

## Server

| Concern | Library |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Language | TypeScript (strict mode) |
| ORM | Prisma 7 (PostgreSQL via `pg` / Neon adapter) |
| Document DB | Mongoose 9 (MongoDB — user/auth models) |
| Cache / sessions | Redis 5 |
| Validation | Zod |
| Auth | bcryptjs, jose (JWT), OTP via crypto |
| Email | Resend |
| Logging | Winston |
| Dev runner | tsx watch |

**Dual-database pattern:** PostgreSQL (via Prisma) holds all relational/business data. MongoDB (via Mongoose) holds user accounts and verification tokens.

---

## Common Commands

### Client
```bash
cd client
npm run dev        # start dev server
npm run build      # tsc + vite build
npm run lint       # eslint
```

### Server
```bash
cd server
npm run dev        # tsx watch src/app.ts
npm run build      # rimraf dist && tsc
npm start          # node dist/app.js
```

### Prisma
```bash
cd server
npx prisma migrate dev     # create and apply a migration
npx prisma migrate deploy  # apply migrations in production
npx prisma generate        # regenerate Prisma client (output: server/generated/prisma)
npx prisma studio          # open Prisma Studio
```

---

## Environment

- Client env vars are prefixed `VITE_` and read via `import.meta.env`
- Server env vars are validated/typed in `server/src/shared/config/env.ts`
- `.env` files live at `client/.env` and `server/.env`
