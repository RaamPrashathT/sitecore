import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { Pencil, X, Check, AlertTriangle, Loader2, FileText } from 'lucide-react'
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
import { useCatalogueQuotes, useUpdateQuote } from '../../hooks/useCatalogueDrawer'
import {
    updateQuoteSchema,
    type UpdateQuoteInput,
    type CatalogueQuoteRow,
} from '../../catalogue.schema'

const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(n)

// ─── Inline edit row ──────────────────────────────────────────────────────────

interface EditFormProps {
    quote: CatalogueQuoteRow
    catalogueId: string
    colSpan: number
    onClose: () => void
}

const QuoteEditRow = ({ quote, catalogueId, colSpan, onClose }: EditFormProps) => {
    const update = useUpdateQuote(catalogueId)
    const { register, handleSubmit, formState: { errors } } = useForm<UpdateQuoteInput>({
        resolver: zodResolver(updateQuoteSchema),
        defaultValues: {
            truePrice: quote.truePrice,
            standardRate: quote.standardRate,
            leadTime: quote.leadTime ?? undefined,
            inventory: quote.inventory,
            changeReason: '',
        },
    })

    const onSubmit = (values: UpdateQuoteInput) => {
        update.mutate({ ...values, quoteId: quote.id }, { onSuccess: onClose })
    }

    return (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
            <TableCell colSpan={colSpan} className="px-3 py-3">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Same column layout as the read row */}
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-2 items-start">
                        <div>
                            <p className="text-label mb-1">Supplier</p>
                            <p className="text-body text-foreground">{quote.supplier.name}</p>
                        </div>
                        <div>
                            <p className="text-label mb-1">True Price</p>
                            <Input type="number" step="0.01" {...register('truePrice', { valueAsNumber: true })} className="h-7 text-xs font-mono" />
                            {errors.truePrice && <p className="text-xs text-destructive mt-0.5">{errors.truePrice.message}</p>}
                        </div>
                        <div>
                            <p className="text-label mb-1">Std Rate</p>
                            <Input type="number" step="0.01" {...register('standardRate', { valueAsNumber: true })} className="h-7 text-xs font-mono" />
                            {errors.standardRate && <p className="text-xs text-destructive mt-0.5">{errors.standardRate.message}</p>}
                        </div>
                        <div>
                            <p className="text-label mb-1">Lead (d)</p>
                            <Input type="number" min={0} {...register('leadTime', { valueAsNumber: true })} className="h-7 text-xs font-mono" />
                        </div>
                        <div>
                            <p className="text-label mb-1">Stock</p>
                            <Input type="number" min={0} {...register('inventory', { valueAsNumber: true })} className="h-7 text-xs font-mono" />
                            {errors.inventory && <p className="text-xs text-destructive mt-0.5">{errors.inventory.message}</p>}
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
                    <div className="mt-2">
                        <p className="text-label mb-1">Change Reason</p>
                        <Input {...register('changeReason')} placeholder="Reason for update…" className="h-7 text-xs" />
                        {errors.changeReason && <p className="text-xs text-destructive mt-0.5">{errors.changeReason.message}</p>}
                    </div>
                </form>
            </TableCell>
        </TableRow>
    )
}

// ─── Columns (defined outside component to avoid re-creation) ─────────────────

const col = createColumnHelper<CatalogueQuoteRow>()

const readColumns = [
    col.accessor((r) => r.supplier.name, {
        id: 'supplier',
        header: 'Supplier',
        cell: (info) => <span className="text-body text-foreground">{info.getValue()}</span>,
    }),
    col.accessor('truePrice', {
        header: 'True Price',
        cell: (info) => <span className="font-mono text-xs tabular-nums">{fmt(info.getValue())}</span>,
    }),
    col.accessor('standardRate', {
        header: 'Std Rate',
        cell: (info) => <span className="font-mono text-xs tabular-nums text-muted-foreground">{fmt(info.getValue())}</span>,
    }),
    col.accessor('leadTime', {
        header: 'Lead',
        cell: (info) => <span className="font-mono text-xs tabular-nums text-muted-foreground">{info.getValue() ?? '—'}d</span>,
    })
]

// Actions column is added separately so it can reference the setter
const actionsColumn = (onEdit: (id: string) => void) =>
    col.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <button
                type="button"
                onClick={() => onEdit(row.original.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Edit quote"
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

const CatalogueQuotesSection = ({ catalogueId, isAdmin }: Props) => {
    const [editingId, setEditingId] = useState<string | null>(null)
    const { data, isLoading, isError } = useCatalogueQuotes(catalogueId)

    const columns = isAdmin ? [...readColumns, actionsColumn(setEditingId)] : readColumns

    const table = useReactTable({
        data: data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const colCount = table.getAllColumns().length

    return (
        <div>
            <p className="text-label uppercase tracking-widest mb-3">Supplier Quotes</p>

            {isLoading && (
                <div className="space-y-2">
                    {Array.from({ length: 3 }, (_, i) => (
                        <Skeleton key={`q-skel-${i}`} className="h-9 w-full rounded-md" />
                    ))}
                </div>
            )}

            {isError && (
                <div className="flex items-center gap-2 py-3 text-destructive text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Failed to load quotes
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
                                            <FileText className="w-5 h-5 text-muted-foreground/30" strokeWidth={1.5} />
                                            <p className="text-sm text-muted-foreground">No quotes available</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) =>
                                    editingId === row.original.id ? (
                                        <QuoteEditRow
                                            key={row.id}
                                            quote={row.original}
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

export default CatalogueQuotesSection
