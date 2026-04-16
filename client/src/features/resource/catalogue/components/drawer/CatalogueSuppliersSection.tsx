import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { Pencil, X, Check, AlertTriangle, Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useCatalogueSuppliers, useUpdateSupplier } from '../../hooks/useCatalogueDrawer'
import {
    updateSupplierSchema,
    type UpdateSupplierInput,
    type CatalogueSupplierRow,
} from '../../catalogue.schema'

// ─── Inline edit row ──────────────────────────────────────────────────────────

interface EditFormProps {
    supplier: CatalogueSupplierRow
    catalogueId: string
    colSpan: number
    onClose: () => void
}

const SupplierEditRow = ({ supplier, catalogueId, colSpan, onClose }: EditFormProps) => {
    const update = useUpdateSupplier(catalogueId)
    const { register, handleSubmit, formState: { errors } } = useForm<UpdateSupplierInput>({
        resolver: zodResolver(updateSupplierSchema),
        defaultValues: {
            name: supplier.name,
            email: supplier.email ?? '',
            phone: supplier.phone ?? '',
            contactPerson: supplier.contactPerson ?? '',
            address: supplier.address ?? '',
        },
    })

    const onSubmit = (values: UpdateSupplierInput) => {
        update.mutate({ ...values, supplierId: supplier.id }, { onSuccess: onClose })
    }

    return (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
            <TableCell colSpan={colSpan} className="px-3 py-3">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-2 items-start">
                        <div>
                            <p className="text-label mb-1">Name</p>
                            <Input {...register('name')} className="h-7 text-xs" />
                            {errors.name && <p className="text-xs text-destructive mt-0.5">{errors.name.message}</p>}
                        </div>
                        <div>
                            <p className="text-label mb-1">Contact</p>
                            <Input {...register('contactPerson')} className="h-7 text-xs" />
                        </div>
                        <div>
                            <p className="text-label mb-1">Email</p>
                            <Input type="email" {...register('email')} className="h-7 text-xs" />
                            {errors.email && <p className="text-xs text-destructive mt-0.5">{errors.email.message}</p>}
                        </div>
                        <div>
                            <p className="text-label mb-1">Phone</p>
                            <Input {...register('phone')} className="h-7 text-xs font-mono" />
                        </div>
                        <div>
                            <p className="text-label mb-1">Address</p>
                            <Input {...register('address')} className="h-7 text-xs" />
                        </div>
                        <div className="flex flex-col gap-1 pt-5">
                            <Button type="submit" size="sm" disabled={update.isPending}
                                className="h-7 w-7 p-0 bg-primary hover:bg-primary/90 text-primary-foreground" aria-label="Save">
                                {update.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            </Button>
                            <Button type="button" variant="ghost" size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground" onClick={onClose} aria-label="Cancel">
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </form>
            </TableCell>
        </TableRow>
    )
}

// ─── Columns (defined outside component) ─────────────────────────────────────

const col = createColumnHelper<CatalogueSupplierRow>()

const nullish = (v: string | null | undefined) =>
    v ? <span className="text-body text-foreground">{v}</span>
      : <span className="text-muted-foreground/40 text-xs">—</span>

const readColumns = [
    col.accessor('name', {
        header: 'Name',
        cell: (info) => <span className="text-body text-foreground font-medium">{info.getValue()}</span>,
    }),
    col.accessor('contactPerson', {
        header: 'Contact',
        cell: (info) => nullish(info.getValue()),
    }),
    col.accessor('email', {
        header: 'Email',
        cell: (info) => nullish(info.getValue()),
    }),
    col.accessor('phone', {
        header: 'Phone',
        cell: (info) => info.getValue()
            ? <span className="font-mono text-xs text-foreground">{info.getValue()}</span>
            : <span className="text-muted-foreground/40 text-xs">—</span>,
    })
]

const actionsColumn = (onEdit: (id: string) => void) =>
    col.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <button
                type="button"
                onClick={() => onEdit(row.original.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Edit supplier"
            >
                <Pencil className="w-3 h-3" />
            </button>
        ),
    })

// ─── Section ──────────────────────────────────────────────────────────────────

interface Props {
    catalogueId: string
    isAdmin: boolean
}

const CatalogueSuppliersSection = ({ catalogueId, isAdmin }: Props) => {
    const [editingId, setEditingId] = useState<string | null>(null)
    const { data, isLoading, isError } = useCatalogueSuppliers(catalogueId)

    const columns = isAdmin ? [...readColumns, actionsColumn(setEditingId)] : readColumns

    const table = useReactTable({
        data: data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const colCount = table.getAllColumns().length

    return (
        <div>
            <p className="text-label uppercase tracking-widest mb-3">Suppliers</p>

            {isLoading && (
                <div className="space-y-2">
                    {Array.from({ length: 2 }, (_, i) => (
                        <Skeleton key={`s-skel-${i}`} className="h-9 w-full rounded-md" />
                    ))}
                </div>
            )}

            {isError && (
                <div className="flex items-center gap-2 py-3 text-destructive text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Failed to load suppliers
                </div>
            )}

            {!isLoading && !isError && (
                <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((hg) => (
                                <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                                    {hg.headers.map((h) => (
                                        <TableHead key={h.id} className="h-8 px-3 text-label whitespace-nowrap">
                                            {flexRender(h.column.columnDef.header, h.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={colCount} className="py-10 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-5 h-5 text-muted-foreground/30" strokeWidth={1.5} />
                                            <p className="text-sm text-muted-foreground">No suppliers linked</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) =>
                                    editingId === row.original.id ? (
                                        <SupplierEditRow
                                            key={row.id}
                                            supplier={row.original}
                                            catalogueId={catalogueId}
                                            colSpan={colCount}
                                            onClose={() => setEditingId(null)}
                                        />
                                    ) : (
                                        <TableRow key={row.id} className="border-b border-border/60 last:border-0">
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="px-3 py-2.5">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    )
                                )
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}

export default CatalogueSuppliersSection
