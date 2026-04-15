# Project Structure

The repo is a monorepo with two top-level packages: `client/` (React SPA) and `server/` (Express API). They are independent — each has its own `package.json`, `tsconfig.json`, and `node_modules/`.

## Client (`client/src/`)

```
src/
├── App.tsx                  # Root router — all routes defined here
├── main.tsx                 # Entry point
├── components/
│   ├── ui/                  # shadcn/ui primitives (Button, Input, Dialog, etc.) — do not edit directly
│   └── organization/        # Shared org-level components (sidebar, org switcher)
├── contexts/
│   └── OrgContext.tsx       # Tenant context provider + OrgGuard route wrapper
├── features/                # Domain modules — primary location for business logic
│   ├── auth/
│   ├── adminDashboard/
│   ├── catalogue/
│   ├── project/
│   ├── engineers/
│   ├── clients/
│   ├── pending/
│   ├── notifications/
│   └── organizationList/
├── pages/                   # Route-level page components — thin wrappers that compose features
│   ├── auth/
│   ├── adminPages/
│   ├── project/
│   ├── organization/
│   └── invitation/
├── hooks/                   # Shared custom hooks (useDebounce, useMembership, etc.)
├── lib/
│   ├── axios.ts             # Axios instance — always import this, never create a new one
│   └── utils.ts             # cn() helper and other utilities
└── utils/                   # Pure helper functions (date formatting, etc.)
```

### Feature Module Layout

Each feature folder follows this structure:

```
features/<domain>/
├── components/   # React components scoped to this feature
└── hooks/        # Data-fetching and mutation hooks (useQuery / useMutation wrappers)
```

## Server (`server/src/`)

```
src/
├── app.ts                   # Express setup — middleware registration and route mounting
├── express.d.ts             # Express Request type augmentation (session, tenant, traceId)
├── modules/                 # Feature modules — one folder per domain
│   ├── auth/
│   ├── catalogue/
│   ├── organization/
│   ├── project/
│   ├── engineers/
│   ├── clients/
│   ├── dashboard/
│   ├── pending/
│   ├── user/
│   ├── inventory/
│   └── supplier-quote/
└── shared/
    ├── config/              # Environment variable validation (env.ts)
    ├── error/               # Custom error classes (UnAuthorizedError, ValidationError, MissingError)
    ├── lib/                 # DB clients — prisma.ts, mongo.ts, redis.ts, logger.ts
    ├── middleware/          # Express middleware (authorize, orgAuthorize, requireRole, trace, responseTime)
    ├── models/              # Shared Mongoose models
    └── utils/               # Shared helper functions
```

### Server Module Layout

Each module folder follows this structure:

```
modules/<domain>/
├── <domain>.route.ts        # Router — maps HTTP methods/paths to controller functions, applies middleware
├── <domain>.controller.ts   # Validates input, calls service, formats HTTP response
├── <domain>.service.ts      # Business logic and database access via Prisma
└── <domain>.schema.ts       # Zod schemas for request validation and TypeScript type inference
```

## Key Conventions

- **Pages are thin** — page components import and compose feature components; they don't contain logic.
- **Hooks own data fetching** — all `useQuery`/`useMutation` calls live in `features/<domain>/hooks/`, never inline in components.
- **Controllers don't touch the DB** — database access belongs in the service layer only.
- **Always use the shared Axios instance** (`@/lib/axios`) — it handles tenant header injection automatically.
- **Validation before logic** — Zod `safeParse` in controllers before any service call; throw `ValidationError` on failure.
- **Custom errors for control flow** — throw `UnAuthorizedError`, `ValidationError`, or `MissingError` from services; catch and map to HTTP status codes in controllers.
- **Middleware order on routes**: `authorize` → `orgAuthorize` → `requiredRole(...)` → controller method.
