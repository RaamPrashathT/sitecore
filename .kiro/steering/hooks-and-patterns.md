# Code Patterns & Architecture Rules

## State Separation — Non-Negotiable

- **TanStack Query** = anything that comes from the server (products, projects, requisitions, users)
- **Zustand** = UI-only state (open dialogs, selected row IDs, active filters, sidebar state)
- These must NEVER overlap. Do not cache API responses in Zustand. Ever.

---

## Hook File Structure — One File Per Resource

Do NOT create one file per mutation. Group by resource:
features/product/hooks/
useProducts.ts       ← all product hooks live here
useRequisitions.ts   ← all requisition hooks live here

Every resource hook file exports multiple hooks but they share the queryOptions factory and key factory:

```ts
// features/product/hooks/useProducts.ts
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import { useShallow } from 'zustand/shallow'
import { useOrgContext } from '@/contexts/OrgContext'
import api from '@/lib/axios'
import type { Product, CreateProductInput, UpdateProductInput } from '../types'

// ─── Query Key Factory ───────────────────────────────────────────────────────
// Single source of truth for all cache keys related to this resource.
// Use these everywhere: hooks, invalidations, prefetching.
export const productKeys = {
  all: (orgId: string) => ['products', orgId] as const,
  detail: (orgId: string, id: string) => ['products', orgId, id] as const,
}

// ─── Query Options Factory ───────────────────────────────────────────────────
// Reuse in hooks, route loaders, and prefetching — never duplicate the key.
export const productsQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: productKeys.all(orgId),
    queryFn: () => api.get<Product[]>(`/products?orgId=${orgId}`).then(r => r.data),
    enabled: !!orgId,
  })

export const productDetailQueryOptions = (orgId: string, id: string) =>
  queryOptions({
    queryKey: productKeys.detail(orgId, id),
    queryFn: () => api.get<Product>(`/products/${id}`).then(r => r.data),
    enabled: !!orgId && !!id,
  })

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useProducts() {
  const { orgId } = useOrgContext()
  const query = useQuery(productsQueryOptions(orgId))

  useEffect(() => {
    if (query.error) toast.error('Failed to load products')
  }, [query.error])

  return query
}

export function useProduct(id: string) {
  const { orgId } = useOrgContext()
  return useQuery(productDetailQueryOptions(orgId, id))
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const { orgId } = useOrgContext()

  return useMutation({
    mutationFn: (data: CreateProductInput) =>
      api.post<Product>('/products', { ...data, orgId }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all(orgId) })
      toast.success('Product created')
    },
    onError: () => toast.error('Failed to create product'),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const { orgId } = useOrgContext()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateProductInput) =>
      api.put<Product>(`/products/${id}`, data).then(r => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all(orgId) })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(orgId, id) })
      toast.success('Product updated')
    },
    onError: () => toast.error('Failed to update product'),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const { orgId } = useOrgContext()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all(orgId) })
      toast.success('Product deleted')
    },
    onError: () => toast.error('Failed to delete product'),
  })
}
```

---

## Zod Schema Pattern

```ts
// features/product/product.schema.ts
import * as z from 'zod'

// Base schema — used as the source of truth
export const productSchema = z.object({
  name: z.string({ error: 'Name is required' }).min(1),
  price: z.number({ error: 'Price must be a number' }).positive(),
  stock: z.number().int().min(0),
  category: z.string().min(1),
})

// Create — full schema
export const createProductSchema = productSchema
export type CreateProductInput = z.infer<typeof createProductSchema>

// Update — all fields optional + id required
// Do NOT use .merge() — it's deprecated in v4
// Do NOT use .pick()/.omit() on schemas that have .refine() — throws in v4
export const updateProductSchema = productSchema.partial().extend({
  id: z.string().uuid(),
})
export type UpdateProductInput = z.infer<typeof updateProductSchema>

// Row type (what the API returns) — extend base with server fields
export const productRowSchema = productSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  organizationId: z.string().uuid(),
})
export type Product = z.infer<typeof productRowSchema>
```

### Zod v4 Rules

- Import: `import * as z from 'zod'` — never `'zod/v4'`
- Error param: `z.string({ error: '...' })` — NOT `invalid_type_error` or `required_error` (dropped in v4)
- `error.issues` not `error.errors`
- `z.strictObject()` not `.strict()` chained method (legacy)
- `z.looseObject()` not `.passthrough()` (legacy)
- `.merge()` → use `.extend()` instead
- `.superRefine()` → use `.refine()` with type predicate
- `optional().default()` now always applies default even when key absent — be deliberate

---

## Form Pattern (RHF + Zod v4)

```ts
// features/product/components/ProductForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProductSchema, type CreateProductInput } from '../product.schema'
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts'

interface ProductFormProps {
  id?: string          // present = edit mode, absent = create mode
  defaultValues?: Partial<CreateProductInput>
  onSuccess: () => void
}

export function ProductForm({ id, defaultValues, onSuccess }: ProductFormProps) {
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: defaultValues ?? { name: '', price: 0, stock: 0, category: '' },
  })

  const create = useCreateProduct()
  const update = useUpdateProduct()
  const isPending = create.isPending || update.isPending  // isPending not isLoading in v5

  function onSubmit(data: CreateProductInput) {
    if (id) {
      update.mutate({ id, ...data }, { onSuccess })
    } else {
      create.mutate(data, { onSuccess })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* shadcn FormField components */}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : id ? 'Update' : 'Create'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## TanStack Table Pattern

```ts
// features/product/components/ProductColumns.tsx
// Column definitions always in their own file — never inside the table component
import { createColumnHelper } from '@tanstack/react-table'
import type { Product } from '../types'

const columnHelper = createColumnHelper<Product>()

export const productColumns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('price', {
    header: 'Price',
    cell: info => `₹${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor('stock', {
    header: 'Stock',
    cell: info => info.getValue(),
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => <ProductRowActions product={row.original} />,
  }),
]

// features/product/components/ProductTable.tsx
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { productColumns } from './ProductColumns'

export function ProductTable({ data }: { data: Product[] }) {
  const table = useReactTable({
    data,
    columns: productColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto w-full">   {/* always — tables scroll on mobile */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(hg => (
            <TableRow key={hg.id}>
              {hg.headers.map(h => (
                <TableHead key={h.id}>
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

### TanStack Table Rules

- Import from `@tanstack/react-table` — NOT `@tanstack/table-core`
- `createColumnHelper<T>()` always — raw `ColumnDef[]` causes React error #418 in React 19
- `flexRender()` always — never call cell functions directly
- `columnHelper.display()` for action columns, checkboxes, expanders
- Column definitions go in `{Feature}Columns.tsx` — never inline in the table component
- When sorting/pagination is server-side, include state in queryKey:

```ts
  queryKey: productKeys.all(orgId)  // add sorting/pagination if server-side
```

---

## Zustand Store Pattern (v5)

```ts
// features/product/hooks/useProductStore.ts
import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'

interface ProductUIState {
  isCreateDialogOpen: boolean
  editingProductId: string | null
  openCreateDialog: () => void
  openEditDialog: (id: string) => void
  closeDialog: () => void
}

const useProductStore = create<ProductUIState>(set => ({
  isCreateDialogOpen: false,
  editingProductId: null,
  openCreateDialog: () => set({ isCreateDialogOpen: true, editingProductId: null }),
  openEditDialog: (id) => set({ isCreateDialogOpen: true, editingProductId: id }),
  closeDialog: () => set({ isCreateDialogOpen: false, editingProductId: null }),
}))

// Selecting multiple values — ALWAYS useShallow in v5 or you get infinite loops
export function useProductDialog() {
  return useProductStore(
    useShallow(s => ({
      isOpen: s.isCreateDialogOpen,
      editingId: s.editingProductId,
      openCreate: s.openCreateDialog,
      openEdit: s.openEditDialog,
      close: s.closeDialog,
    }))
  )
}

// Selecting single primitive — no useShallow needed
export function useIsProductDialogOpen() {
  return useProductStore(s => s.isCreateDialogOpen)
}
```

### Zustand v5 Rules

- `import { create } from 'zustand'` — named import, no default
- Multi-value selectors MUST use `useShallow` — causes infinite loops without it in v5
- Single primitive selectors are fine without `useShallow`
- Export focused selector hooks (`useProductDialog`) not the raw store — components shouldn't know store shape
- Zustand stores UI state only — dialogs, selected IDs, filter state, sidebar open/closed

---

## Server Module Pattern

```ts
// modules/product/product.routes.ts
router.get('/', authorize(['ADMIN', 'ENGINEER']), getProducts)
router.post('/', authorize(['ADMIN']), validate(createProductSchema), createProduct)
router.put('/:id', authorize(['ADMIN']), validate(updateProductSchema), updateProduct)
router.delete('/:id', authorize(['ADMIN']), deleteProduct)

// modules/product/product.controller.ts
// Thin — only req/res. No logic. No try/catch.
export const getProducts = async (req: Request, res: Response) => {
  const data = await productService.getAll(req.user.organizationId)
  res.json({ data })
}

// modules/product/product.service.ts
// All logic lives here. Throws AppError. Never returns errors.
export const getAll = async (organizationId: string) => {
  // organizationId ALWAYS from req.user — never from req.body
  return prisma.product.findMany({
    where: { organizationId }
  })
}
```

### Server Rules

- Controllers are thin — no business logic, no try/catch
- Services throw `AppError` — error middleware catches it
- `organizationId` always from `req.user` — never trust client-provided orgId
- Every single Prisma query MUST include `where: { organizationId }` — no exceptions
- Route order: `authorize()` → `validate()` → controller

---

## What Goes Where — Quick Reference

| Thing | Where |
|---|---|
| API call + cache logic | `features/[f]/hooks/use[Resource].ts` |
| Query key definitions | Same file, exported `[resource]Keys` object |
| QueryOptions factories | Same file, exported `[resource]QueryOptions` |
| UI state (dialogs, selection) | `features/[f]/hooks/use[Resource]Store.ts` |
| Zod schemas + inferred types | `features/[f]/[feature].schema.ts` |
| Table column definitions | `features/[f]/components/[Resource]Columns.tsx` |
| Table component | `features/[f]/components/[Resource]Table.tsx` |
| Form component | `features/[f]/components/[Resource]Form.tsx` |
| Dialog wrapping form | `features/[f]/components/[Resource]Dialog.tsx` |
| Shared hooks across features | `src/hooks/` |
| shadcn components | `src/components/ui/` — never edit these |
| Truly shared feature components | `src/components/` with explicit name, not dumped in `organization/` |

## NEVER

- One file per mutation (`useCreateProduct.ts`, `useUpdateProduct.ts` as separate files)
- `queryKey: ['products']` hardcoded anywhere — always use the key factory
- `useQuery` called directly inside a component
- Server data in Zustand
- Multi-value Zustand selector without `useShallow`
- `organizationId` from `req.body` on the server
- Logic in controllers
- `any` type
- Inline styles
- Direct axios import — always `@/lib/axios`
