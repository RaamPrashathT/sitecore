import { createColumnHelper } from '@tanstack/react-table';
import type { CatalogueWithQuotes } from '@/hooks/useGetCatalogs'; 

const columnHelper = createColumnHelper<CatalogueWithQuotes>();

export const columns = [
    columnHelper.accessor('name', {
        header: "Item Name",
        cell: info => (
            <div className='font-bold flex items-center h-full'>
                {info.getValue()}
            </div>
        )
    }),

    columnHelper.accessor('category', {
        header: "Category",
        cell: info => (
            <div className='font-bold flex items-center h-full'>
                {info.getValue()}
            </div>
        )
    }),

    columnHelper.display({
        id: 'supplier',
        header: "Supplier",
        cell: ({row}) => {
            return (
                <div className="flex flex-col divide-y w-full">
                    {row.original.supplierQuotes.map((quote) => (
                        <div 
                            key={quote.id}
                            className='flex items-center'
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
                <div className="flex flex-col divide-y w-full">
                    {row.original.supplierQuotes.map((quote) => (
                        <div 
                            key={quote.id}
                            className='flex items-center'
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
                <div className="flex flex-col divide-y w-full">
                    {row.original.supplierQuotes.map((quote) => (
                        <div 
                            key={quote.id}
                            className='flex items-center'
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
                <div className="flex flex-col divide-y w-full">
                    {row.original.supplierQuotes.map((quote) => (
                        <div 
                            key={quote.id}
                            className='flex items-center'
                        >
                            {quote.leadTime ? quote.leadTime : defaultLeadTime}
                        </div>
                    ))}
                </div>
            )
        }
    }),

    
]