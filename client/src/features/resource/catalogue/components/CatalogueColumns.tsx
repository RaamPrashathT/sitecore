import { createColumnHelper } from '@tanstack/react-table'
import type { CatalogueItem, CatalogueCategory } from '../catalogue.schema'

const columnHelper = createColumnHelper<CatalogueItem>()


const CATEGORY_LABEL: Record<CatalogueCategory, string> = {
    MATERIALS:      'Materials',
    LABOUR:         'Labour',
    EQUIPMENT:      'Equipment',
    SUBCONTRACTORS: 'Subcontractors',
    TRANSPORT:      'Transport',
    OVERHEAD:       'Overhead',
}

// Dot colour — one distinct hue per category, used sparingly
const CATEGORY_DOT: Record<CatalogueCategory, string> = {
    MATERIALS:      'bg-slate-400',
    LABOUR:         'bg-blue-500',
    EQUIPMENT:      'bg-amber-500',
    SUBCONTRACTORS: 'bg-violet-500',
    TRANSPORT:      'bg-teal-500',
    OVERHEAD:       'bg-rose-500',
}


// ─── Column definitions ───────────────────────────────────────────────────────

export const catalogueColumns = [
    columnHelper.accessor('name', {
        header: 'Item',
        cell: (info) => (
            <span className="text-body text-foreground">
                {info.getValue()}
            </span>
        ),
    }),

    columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => {
            const cat = info.getValue() as CatalogueCategory
            return (
                <span
                    className="row gap-2"
                    title={CATEGORY_LABEL[cat]}
                >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CATEGORY_DOT[cat]}`} />
                    <span className="text-label hidden sm:inline">
                        {CATEGORY_LABEL[cat]}
                    </span>
                </span>
            )
        },
    }),

    columnHelper.accessor('unit', {
        header: 'Unit',
        cell: (info) => (
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                {info.getValue()}
            </span>
        ),
    }),

    columnHelper.accessor('defaultLeadTime', {
        header: 'Lead Time',
        cell: (info) => {
            const days = info.getValue()
            return (
                <span className={`font-mono text-sm tabular-nums`}>
                    {days}
                    <span className="text-xs ml-1 font-normal opacity-60">days</span>
                </span>
            )
        },
    }),

    columnHelper.accessor('quotesCount', {
        header: 'Quotes',
        cell: (info) => {
            const n = info.getValue()
            return (
                <span className={`font-mono text-sm tabular-nums ${n === 0 ? 'text-muted-foreground/40' : 'text-foreground'}`}>
                    {n}
                </span>
            )
        },
    }),

    columnHelper.accessor('suppliersCount', {
        header: 'Suppliers',
        cell: (info) => {
            const n = info.getValue()
            return (
                <span className={`font-mono text-sm tabular-nums ${n === 0 ? 'text-muted-foreground/40' : 'text-foreground'}`}>
                    {n}
                </span>
            )
        },
    }),

    columnHelper.accessor('locationsCount', {
        header: 'Locations',
        cell: (info) => {
            const n = info.getValue()
            return (
                <span className={`font-mono text-sm tabular-nums ${n === 0 ? 'text-muted-foreground/40' : 'text-foreground'}`}>
                    {n}
                </span>
            )
        },
    }),
]
