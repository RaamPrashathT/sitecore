import { createColumnHelper } from '@tanstack/react-table';
import type { CatalogueWithQuotes } from '@/hooks/useGetCatalogs';
import CatalogueActionButton from './CatalogueActionButton';

const columnHelper = createColumnHelper<CatalogueWithQuotes>();

export const CatalogueColumns = [
    columnHelper.accessor('name', {
        header: "Item Name",
        cell: info => (
            <div className='flex min-h-12 items-center px-4 font-sans text-sm font-medium text-foreground'>
                {info.getValue()}
            </div>
        )
    }),

    columnHelper.accessor('category', {
        header: "Category",
        cell: info => (
            <div className='flex min-h-12 items-center px-4 font-sans text-sm font-medium capitalize text-muted-foreground'>
                {info.getValue().toLowerCase()}
            </div>
        )
    }),

    columnHelper.display({
        id: 'supplier',
        header: "Supplier",
        cell: ({row}) => {
            return (
                <div className="flex w-full flex-col divide-y divide-border/60">
                    {row.original.supplierQuotes.map((quote) => (
                        <div 
                            key={quote.id}
                            className='flex min-h-12 items-center px-4 font-sans text-sm text-foreground'
                        >
                            {quote.supplier}
                        </div>
                    ))}
                </div>
            )
        }
    }),

    columnHelper.display({
        id: 'truePrice',
        header: "True Price",
        cell: ({row}) => {
            const unit = row.original.unit;
            return (
                <div className="flex w-full flex-col divide-y divide-border/60">
                    {row.original.supplierQuotes.map((quote) => (
                        <div 
                            key={quote.id}
                            className='flex min-h-12 items-center px-4 font-mono text-sm text-foreground tabular-nums'
                        >
                            {quote.truePrice}/{unit}
                        </div>
                    ))}
                </div>
            )
        }
    }),

    columnHelper.display({
        id: 'standardRate',
        header: "Standard Rate",
        cell: ({row}) => {
            const unit = row.original.unit;
            return (
                <div className="flex w-full flex-col divide-y divide-border/60">
                    {row.original.supplierQuotes.map((quote) => (
                        <div 
                            key={quote.id}
                            className='flex min-h-12 items-center px-4 font-mono text-sm text-foreground tabular-nums'
                        >
                            {quote.standardRate}/{unit}
                        </div>
                    ))}
                </div>
            )
        }
    }),

    columnHelper.display({
        id: 'leadTime',
        header: "Lead Time",
        cell: ({row}) => {
            const defaultLeadTime = row.original.defaultLeadTime;
            return (
                <div className="flex w-full flex-col divide-y divide-border/60">
                    {row.original.supplierQuotes.map((quote) => (
                        <div 
                            key={quote.id}
                            className='flex min-h-12 items-center px-4 font-mono text-sm text-muted-foreground tabular-nums'
                        >
                            {quote.leadTime ? quote.leadTime : defaultLeadTime}
                        </div>
                    ))}
                </div>
            )
        }
    }),

    columnHelper.display({
        id: 'Actions',
        header: "Actions",
        cell: ({row}) => {
            return (
                <div className="flex w-full flex-col divide-y divide-border/60">
                    {row.original.supplierQuotes.map((quote) => (
                        <div key={quote.id} 
                        className='flex min-h-12 items-center px-3'>
                            <CatalogueActionButton quoteId={quote.id} catalogueId={quote.catalogueId} />
                        </div>
                    ))}
                </div>
            )
        }
    }),
    
]