# Tech Stack

## Architecture

Full-stack TypeScript application with separate client and server codebases.

## Frontend (client/)

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7 with SWC
- **Styling**: Tailwind CSS v4 (config lives in CSS via @theme — NO tailwind.config.js)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Server State**: TanStack Query v5
- **Client State**: Zustand v5
- **Forms**: React Hook Form + Zod v4
- **Routing**: React Router DOM v7
- **Tables**: TanStack Table v8
- **Icons**: Lucide React, Tabler Icons, React Icons
- **Other**: date-fns, axios, js-cookie

## Backend (server/)

- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5
- **Database**: PostgreSQL via Prisma ORM (generated to server/generated/prisma)
- **Additional**: MongoDB (Mongoose), Redis
- **Auth**: JWT (jose), bcryptjs
- **Email**: Resend
- **Logging**: Winston
- **Validation**: Zod v4

---

## Critical Version Rules — Read Before Generating Any Code

### Zod v4

Zod v4 ships inside the zod package but under a subpath.

- Import ALWAYS as: `import * as z from 'zod'` (NOT 'zod/v4' — that was the beta path)
- After zod@4.0.0 was promoted to the package root, `import * as z from 'zod'` gives you v4
- `z.ZodTypeAny` is gone — use `z.ZodType` instead
- Error shape changed: `error.errors` is now `error.issues`
- `invalid_type_error` and `required_error` params are DROPPED — use unified `error` param
- `.strict()` and `.passthrough()` chained methods are LEGACY — use `z.strictObject()` / `z.looseObject()`
- `.merge()` is DEPRECATED — use `.extend()` instead
- `.superRefine()` is DEPRECATED — use `.refine()` with type predicates
- `optional().default()` behavior changed: defaults now apply even when key is absent
  - v3: `schema.parse({})` → `{}`
  - v4: `schema.parse({})` → `{ field: "defaultValue" }`
- `.pick()` / `.omit()` on schemas with `.refine()` now THROWS — create a new schema from `.shape` first
- Infer types as always: `type T = z.infer<typeof schema>`
- New in v4: `z.toJSONSchema(schema)` for OpenAPI generation (useful for Postman)

### TanStack Query v5

- Object-only syntax — no overloads:

```ts
  // CORRECT
  useQuery({ queryKey: [...], queryFn: ... })
  // WRONG — no longer valid
  useQuery(['key'], fetchFn)
```

- `onSuccess` / `onError` / `onSettled` callbacks REMOVED from `useQuery` — handle in `useEffect`
- `onSuccess` / `onError` in `useMutation` still work — use them there
- `isLoading` renamed to `isPending` for queries
- `isLoading` now means `isPending && isFetching` (initial load only)
- `cacheTime` renamed to `gcTime`
- `keepPreviousData` removed — use `placeholderData: keepPreviousData` (import the util)
- Always use `queryOptions()` helper for shared query definitions:

```ts
  export const productQueryOptions = (orgId: string) =>
    queryOptions({
      queryKey: ['products', orgId],
      queryFn: () => api.get(`/products?orgId=${orgId}`).then(r => r.data),
    })
```

### TanStack Table v8

- Import from `@tanstack/react-table` — NOT `@tanstack/table-core`
- Always use `createColumnHelper<T>()` — raw `ColumnDef[]` with useMemo can cause React error #418 in React 19
- `flexRender()` required for rendering cells — never call cell functions directly
- Columns defined OUTSIDE component (module level) or with `useMemo`
- `columnHelper.display()` for non-data columns (actions, checkboxes)
- `columnHelper.accessor()` for data columns — fully typed
- Table + Query pattern: include table state (sorting, pagination) in queryKey:

```ts
  queryKey: ['products', orgId, { sorting, pagination }]
```

### Zustand v5

- Named imports only: `import { create } from 'zustand'` — no default exports
- Selecting multiple values requires `useShallow` to avoid infinite loops:

```ts
  // WRONG — causes infinite loop in v5
  const { a, b } = useStore(s => ({ a: s.a, b: s.b }))
  // CORRECT
  import { useShallow } from 'zustand/shallow'
  const { a, b } = useStore(useShallow(s => ({ a: s.a, b: s.b })))
```

- Single value selectors are fine without useShallow: `const a = useStore(s => s.a)`
- `persist` middleware no longer stores initial state by default — set state explicitly after creation if needed
- Zustand is for CLIENT state only (UI state, filters, modals, selected rows)
- NEVER duplicate server data from TanStack Query into Zustand — causes sync bugs

### React Hook Form + Zod v4

```ts
import { zodResolver } from '@hookform/resolvers/zod'
// zodResolver works with Zod v4 from @hookform/resolvers v3.10+
// make sure @hookform/resolvers is up to date
```

---

## Import Rules (Strict)

- shadcn components: `@/components/ui/[component]`. For shadCN only use the already present files only.
- Feature hooks: `@/features/[feature]/hooks/`
- Shared hooks: `@/hooks/`
- Axios instance: `@/lib/axios` — NEVER import axios directly
- Prisma client: `../../generated/prisma` (server-side)
- Zod: `import * as z from 'zod'`

## NEVER

- Install new packages without asking
- Use `any` type
- Write inline styles
- Create tailwind.config.js (Tailwind v4 uses CSS config)
- Import axios directly
- Call `useQuery` inside a component — always wrap in a custom hook
- Put server state (API data) in Zustand
- Use deprecated Zod v3 APIs (`.merge()`, `superRefine()`, `invalid_type_error`)