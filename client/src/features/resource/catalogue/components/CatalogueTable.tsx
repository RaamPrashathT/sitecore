import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { catalogueColumns } from './CatalogueColumns'
import type { CatalogueItem } from '../catalogue.schema'
import { ChevronUp, ChevronDown, Package } from 'lucide-react'

interface CatalogueTableProps {
    data: CatalogueItem[]
    onRowClick: (item: CatalogueItem) => void
}

const SortIcon = ({ sorted }: { sorted: false | 'asc' | 'desc' }) => {
    if (sorted === 'asc') return <ChevronUp className="w-3 h-3 text-primary" />
    if (sorted === 'desc') return <ChevronDown className="w-3 h-3 text-primary" />
    return (
        <span className="flex flex-col gap-px opacity-25">
            <ChevronUp className="w-2.5 h-2.5" />
            <ChevronDown className="w-2.5 h-2.5 -mt-1" />
        </span>
    )
}

const CatalogueTable = ({ data, onRowClick }: CatalogueTableProps) => {
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable({
        data,
        columns: catalogueColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: { sorting },
    })

    const isEmpty = data.length === 0

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id} className="border-b border-border">
                            {hg.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="text-left px-4 py-2.5 text-label select-none whitespace-nowrap"
                                    onClick={header.column.getToggleSortingHandler()}
                                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                                >
                                    <span className="row gap-1.5">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getCanSort() && (
                                            <SortIcon sorted={header.column.getIsSorted()} />
                                        )}
                                    </span>
                                </th>
                            ))}
                            <th className="w-8" />
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {isEmpty ? (
                        <tr>
                            <td
                                colSpan={catalogueColumns.length + 1}
                                className="px-4 py-20 text-center"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Package className="w-7 h-7 text-muted-foreground/25" strokeWidth={1.5} />
                                    <p className="text-body text-foreground">No catalogue items</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map((row, i) => (
                            <tr
                                key={row.id}
                                onClick={() => onRowClick(row.original)}
                                className={`
                                    group cursor-pointer border-b border-border/60 last:border-0
                                    transition-colors duration-100
                                    hover:bg-primary/4
                                    ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                                `}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                                <td className="w-8 pr-3">
                                    <ChevronDown
                                        className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/40 -rotate-90 transition-all duration-100"
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default CatalogueTable
