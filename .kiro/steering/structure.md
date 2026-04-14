# Project Structure

## Root
```
/
├── client/          # React SPA
├── server/          # Express API
└── node_modules/    # Root-level Redis deps only
```

---

## Client (`client/src/`)

```
src/
├── App.tsx                  # Root router — all routes defined here
├── main.tsx
├── index.css
├── components/
│   ├── ui/                  # shadcn/ui primitives (do not modify directly)
│   └── organization/        # Shared org-level layout components (sidebar etc.)
├── contexts/
│   └── OrgContext.tsx       # Org guard — injects current org into context
├── features/                # Feature modules (primary code location)
│   └── <feature>/
│       ├── components/      # UI components scoped to this feature
│       └── hooks/           # TanStack Query hooks (useGet*, useMutate*, etc.)
├── hooks/                   # Shared/global hooks
├── lib/
│   ├── axios.ts             # Axios singleton with tenant/project header injection
│   ├── utils.ts             # cn() and other shared utilities
│   └── ...
├── pages/                   # Route-level page components (thin wrappers)
│   ├── auth/
│   ├── adminPages/
│   ├── organization/
│   └── project/
└── utils/                   # Pure utility functions (e.g. dateConverter)
```

### Client Conventions
- Pages in `pages/` are thin — they import and render feature components
- Business logic lives in `features/<name>/hooks/` as TanStack Query hooks
- All API calls go through the `api` axios instance from `@/lib/axios.ts`
- The axios interceptor automatically injects `x-tenant-slug` and `x-project-slug` headers from the URL
- Form validation schemas use Zod, co-located with the feature (e.g. `authSchema.ts`)
- UI primitives come from `components/ui/` (shadcn); custom components go in `features/` or `components/`
- Use `@/` alias for all imports within `client/src/`

---

## Server (`server/src/`)

```
src/
├── app.ts                   # Express app entry — mounts all routers
├── modules/                 # Feature modules
│   └── <module>/
│       ├── <module>.controller.ts   # Request handling, calls service
│       ├── <module>.service.ts      # Business logic
│       ├── <module>.schema.ts       # Zod validation schemas
│       └── <module>.route(s).ts     # Express router
└── shared/
    ├── config/
    │   └── env.ts           # Typed env var config
    ├── error/               # Custom error classes (ConflictError, UnAuthorizedError, etc.)
    ├── lib/                 # Singletons: prisma, mongo, redis, logger, resend, otp, etc.
    ├── middleware/          # Express middleware (auth, validation, tracing, etc.)
    ├── models/              # Mongoose models (user, verification token)
    └── utils/               # Shared utilities (slugify, session)
```

### Server Conventions
- Each module follows the pattern: `route → controller → service`
- Controllers handle HTTP concerns only; all logic is in the service
- Request bodies are validated with the `validate(schema)` middleware using Zod before reaching the controller
- Custom error classes in `shared/error/` are thrown from services and caught by Express error handling
- Prisma client is imported from `shared/lib/prisma.ts`; Mongoose models from `shared/models/`
- All imports use `.js` extensions (ESM requirement), even for `.ts` source files
- Slugs are generated via `shared/utils/slugify.ts` and stored with `slugBase` + `slugIndex` for uniqueness

---

## Database Split

| Data | Database | Access |
|---|---|---|
| Users, auth tokens | MongoDB | Mongoose models in `shared/models/` |
| Everything else (orgs, projects, phases, etc.) | PostgreSQL | Prisma client from `shared/lib/prisma.ts` |

Prisma schema: `server/prisma/schema.prisma`  
Generated client output: `server/generated/prisma`
