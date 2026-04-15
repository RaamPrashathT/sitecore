# Tech Stack

## Frontend (`client/`)

- **Framework**: React 19 with TypeScript 5.9
- **Build Tool**: Vite 7 with SWC transpiler (`@vitejs/plugin-react-swc`)
- **Styling**: Tailwind CSS 4 (Vite plugin), `clsx` + `tailwind-merge` for conditional classes
- **UI Components**: shadcn/ui pattern built on Radix UI primitives — components live in `client/src/components/ui/`
- **Icons**: Lucide React, Tabler Icons, React Icons
- **Routing**: React Router DOM 7 (nested routes, URL-based tenant/project scoping)
- **Server State**: TanStack React Query 5 (`useQuery`, `useMutation`, `queryClient.invalidateQueries`)
- **Client State**: Zustand 5
- **HTTP Client**: Axios — single instance in `client/src/lib/axios.ts` with interceptors that auto-inject `x-tenant-slug` and `x-project-slug` headers
- **Forms**: React Hook Form 7 + Zod 4 (`@hookform/resolvers/zod`)
- **Tables**: TanStack React Table 8
- **Maps**: Leaflet + React Leaflet
- **Path Alias**: `@/` maps to `client/src/`

## Backend (`server/`)

- **Runtime**: Node.js (ES modules, `"type": "module"`)
- **Framework**: Express 5
- **Language**: TypeScript 5.9 (strict mode, ES2023 target)
- **ORM**: Prisma 7 with PostgreSQL (adapters: Neon, PG, PPG)
- **Cache / Sessions**: Redis 5 — sessions stored as `session:{id}` keys
- **Auth**: JWT via `jose`, passwords hashed with `bcryptjs`, sessions via cookies
- **Email**: Resend
- **Validation**: Zod 4
- **Logging**: Winston (structured, with `traceId`, `userId`, `endpoint` context)
- **Dev Runner**: `tsx watch` for hot reload during development

## Common Commands

### Client
```bash
# from client/
npm run dev        # Vite dev server (HMR)
npm run build      # Type-check + production bundle
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Server
```bash
# from server/
npm run dev        # tsx watch (auto-reload)
npm run build      # tsc compile to dist/
npm run start      # Run compiled dist/app.js
npm run clean      # Remove dist/
```

### Database
```bash
# from server/
npx prisma migrate dev       # Apply migrations in development
npx prisma generate          # Regenerate Prisma client after schema changes
npx prisma studio            # Open Prisma Studio GUI
```
