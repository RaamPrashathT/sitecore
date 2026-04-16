import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { AlertTriangle, Warehouse } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useCatalogueStocks } from '../../hooks/useCatalogueDrawer'
import type { CatalogueStockRow } from '../../catalogue.schema'
import { format } from 'date-fns'

const col = createColumnHelper<CatalogueStockRow>()

const columns = [
    col.accessor((r) => r.location?.name ?? r.locationId, {
        id: 'location',
        header: 'Location',
        cell: (info) => <span className="text-body text-foreground">{info.getValue()}</span>,
    }),
    col.accessor((r) => r.availableQuantity ?? r.quantity ?? 0, {
        id: 'available',
        header: 'Available',
        cell: (info) => (
            <span className="font-mono text-sm tabular-nums text-foreground">
                {info.getValue().toLocaleString('en-IN')}
            </span>
        ),
    }),
    col.accessor('reservedQuantity', {
        header: 'Reserved',
        cell: (info) => {
            const v = info.getValue()
            return (
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {v == null ? '—' : v.toLocaleString('en-IN')}
                </span>
            )
        },
    }),
    col.accessor('updatedAt', {
        header: 'Updated At',
        cell: (info) => {
            const v = info.getValue()
            return (
                <span className="font-mono text-xs text-muted-foreground">
                    {v ? format(new Date(v), 'MMM d') : '—'}
                </span>
            )
        },
    }),
]

interface Props {
    catalogueId: string
}

const CatalogueStocksSection = ({ catalogueId }: Props) => {
    const { data, isLoading, isError } = useCatalogueStocks(catalogueId)

    const table = useReactTable({
        data: data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div>
            <p className="text-label uppercase tracking-widest mb-3">Inventory Locations</p>

            {isLoading && (
                <div className="space-y-2">
                    {Array.from({ length: 3 }, (_, i) => (
                        <Skeleton key={`st-skel-${i}`} className="h-9 w-full rounded-md" />
                    ))}
                </div>
            )}

            {isError && (
                <div className="flex items-center gap-2 py-3 text-destructive text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Failed to load stock locations
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
                                    <TableCell colSpan={columns.length} className="py-10 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Warehouse className="w-5 h-5 text-muted-foreground/30" strokeWidth={1.5} />
                                            <p className="text-sm text-muted-foreground">No inventory locations found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className="border-b border-border/60 last:border-0">
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-3 py-2.5">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}

export default CatalogueStocksSection
