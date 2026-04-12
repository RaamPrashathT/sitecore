# Project Structure

## Root Layout

```
/
├── client/          # React frontend application
├── server/          # Express backend API
├── .kiro/           # Kiro AI configuration and steering
└── node_modules/    # Root-level dependencies (Redis)
```

## Client Structure (client/src/)

### Feature-Based Organization

```
src/
├── features/              # Feature modules (primary organization)
│   ├── auth/             # Authentication & authorization
│   ├── adminDashboard/   # Admin dashboard with requisitions
│   ├── catalogue/        # Catalogue management
│   ├── clients/          # Client management
│   ├── dashboard/        # General dashboard
│   ├── engineers/        # Engineer management
│   ├── inventory/        # Inventory tracking
│   ├── organization/     # Organization & team management
│   ├── pending/          # Pending approvals
│   ├── project/          # Project management
│   ├── requisition/      # Requisition workflows
│   ├── siteLog/          # Site logging
│   └── supplier/         # Supplier management
│
├── components/           # Shared components
│   ├── ui/              # shadcn/ui components (Radix primitives)
│   └── organization/    # Org-specific shared components
│
├── contexts/            # React contexts (OrgContext)
├── hooks/               # Shared custom hooks
├── lib/                 # Utility libraries and configurations
├── pages/               # Route page components
├── utils/               # Utility functions
├── App.tsx              # Root application component
└── main.tsx             # Application entry point
```

### Feature Module Pattern

Each feature follows this structure:
```
features/{feature-name}/
├── components/          # Feature-specific components
├── hooks/              # Feature-specific hooks (React Query, mutations)
├── {feature}.schema.ts # Zod validation schemas
└── types.ts            # TypeScript types (if needed)
```

## Server Structure (server/src/)

### Module-Based Organization

```
src/
├── modules/                    # Feature modules
│   ├── auth/                  # Authentication
│   ├── catalogue/             # Catalogue CRUD
│   ├── clients/               # Client management
│   ├── dashboard/             # Dashboard data
│   ├── engineers/             # Engineer management
│   ├── organization/          # Organization operations
│   ├── pending/               # Pending approvals
│   ├── project/               # Project management
│   └── user/                  # User operations
│
├── shared/                    # Shared utilities
│   ├── config/               # Configuration (env variables)
│   ├── error/                # Error handling
│   ├── lib/                  # Libraries (mongo, logger, prisma)
│   ├── middleware/           # Express middleware
│   │   ├── authorize.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── trace.middleware.ts
│   │   └── responseTime.middleware.ts
│   ├── models/               # Mongoose models
│   └── utils/                # Utility functions
│
├── app.ts                    # Express app setup and routes
└── express.d.ts              # Express type extensions
```

### Module Pattern

Each module follows this structure:
```
modules/{module-name}/
├── {module}.routes.ts      # Express routes
├── {module}.controller.ts  # Request handlers
├── {module}.service.ts     # Business logic
├── {module}.schema.ts      # Zod validation schemas
└── {module}.types.ts       # TypeScript types (if needed)
```

## Key Conventions

### Naming
- **Files**: kebab-case for all files (`auth.controller.ts`, `admin-dashboard.tsx`)
- **Components**: PascalCase for React components
- **Hooks**: camelCase starting with `use` prefix
- **Routes**: kebab-case URLs

### Import Aliases
- Client: `@/` maps to `client/src/`
- Server: No alias configured (relative imports)

### Route Organization
- Client routes defined in `App.tsx` using React Router
- Server routes registered in `app.ts` with module-specific routers

### Middleware Order (Server)
1. CORS
2. Trace middleware (request tracking)
3. Response time middleware
4. Cookie parser
5. JSON body parser
6. Route handlers

### Database Access
- Prisma client for PostgreSQL (generated to `server/generated/prisma`)
- Mongoose for MongoDB
- Redis client for caching/sessions

### Validation Pattern
- Zod schemas defined in `{module}.schema.ts`
- Validated via `validate()` middleware on routes
- Shared schemas between client and server where applicable

## Feature Module Anatomy (Strict Pattern)

### Client Feature
Every new client feature MUST follow this exact pattern:

features/{feature}/
├── components/
│   ├── {Feature}Table.tsx       # TanStack Table component
│   ├── {Feature}Form.tsx        # RHF + Zod form (create/edit combined)
│   ├── {Feature}Dialog.tsx      # shadcn Dialog wrapping the form
│   └── {Feature}Columns.tsx     # TanStack Table column definitions
├── hooks/
│   ├── use{Feature}.ts          # GET — wraps useQuery
│   ├── useCreate{Feature}.ts    # POST — wraps useMutation
│   ├── useUpdate{Feature}.ts    # PUT — wraps useMutation
│   └── useDelete{Feature}.ts    # DELETE — wraps useMutation
└── {feature}.schema.ts          # All Zod schemas for this feature

### Server Module
Every new server module MUST follow this exact pattern:

modules/{module}/
├── {module}.routes.ts      # Route definitions + middleware chain
├── {module}.controller.ts  # Thin — only req/res handling, no logic
├── {module}.service.ts     # All business logic lives here
└── {module}.schema.ts      # Zod schemas for request validation

## Critical Rules
- Controllers must be thin — extract ALL logic to service
- Never call Prisma directly in a controller
- Routes must use validate() middleware before controller
- One hook per operation — never combine create and update in one hook
- Column definitions always go in {Feature}Columns.tsx, never inside the Table component