import { createColumnHelper } from '@tanstack/react-table';
import type { CatalogueWithQuotes } from '@/hooks/useGetCatalogs';
import CatalogueActionButton from './CatalogueActionButton';

const columnHelper = createColumnHelper<CatalogueWithQuotes>();

export const columns = [
    columnHelper.accessor('name', {
        header: "Item Name",
        cell: info => (
            <div className='font-medium flex items-center h-full'>
                {info.getValue()}
            </div>
        )
    }),

    columnHelper.accessor('category', {
        header: "Category",
        cell: info => (
            <div className='font-medium flex items-center h-full capitalize px-0'>
                {info.getValue().toLowerCase()}
            </div>
        )
    }),

    columnHelper.display({
        id: 'supplier',
        header: "Supplier",
        cell: ({row}) => {
            return (
                <div className="flex flex-col divide-y w-full bg-red-500 p-0">
                    {row.original.supplierQuotes.map((quote) => (
                        <div 
                            key={quote.id}
                            className='flex items-center p-0 font-medium'
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
                            className='flex items-center p-0 font-medium'
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
                <div className="flex flex-col divide-y w-full  bg-green-500">
                    {row.original.supplierQuotes.map((quote) => (
                        <div 
                            key={quote.id}
                            className='flex items-center p-0 font-medium '
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
                            className='flex items-center px-0 font-medium'
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
                <div className="flex flex-col divide-y w-full">
                    {row.original.supplierQuotes.map((quote) => (
                        <div key={quote.id} >
                            <CatalogueActionButton quoteId={quote.id} catalogueId={quote.catalogueId} />
                        </div>
                    ))}
                </div>
            )
        }
    }),
    
]