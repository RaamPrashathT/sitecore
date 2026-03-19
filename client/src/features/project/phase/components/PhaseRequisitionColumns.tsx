import { createColumnHelper } from '@tanstack/react-table';
import type { PhaseItem } from '@/features/project/phase/hooks/usePhaseList';

const columnHelper = createColumnHelper<PhaseItem>();

export const phaseRequisitionColumns = [
    columnHelper.accessor('itemName', {
        header: "Item Name",
        cell: info => (
            <div className='font-medium flex items-center h-12 px-4'>
                {info.getValue()}
            </div>
        )
    }),

    columnHelper.accessor('supplierName', {
        header: "Supplier Name",
        cell: info => (
            <div className='font-medium flex items-center h-12 px-4 capitalize'>
                {info.getValue()}
            </div>
        )
    }),


    columnHelper.accessor('standardRate', {
        header: "Standard Rate",
        cell: info => (
            <div className='font-medium flex items-center h-12 px-4 capitalize'>
                {info.getValue()}
            </div>
        )
    }),


    columnHelper.accessor('quantity', {
        header: "Quantity",
        cell: info => (
            <div className='font-medium flex items-center h-12 px-4 capitalize'>
                {info.getValue()}/{info.row.original.unit}
            </div>
        )
    }),

    columnHelper.accessor('estimatedUnitCost', {
        header: "Total cost",
        cell: info => (
            <div className='font-medium flex items-center h-12 px-4 capitalize'>
                {info.getValue()}
            </div>
        )
    }),
]