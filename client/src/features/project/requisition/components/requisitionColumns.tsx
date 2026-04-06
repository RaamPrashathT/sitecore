import { createColumnHelper } from "@tanstack/react-table";
import type { CatalogueWithQuotes } from "../hooks/useGetRequisitionCatalogue";
import QuantityActionRow from "./QuantityAction";
import TotalItemCount from "./TotalItemCount";

const columnHelper = createColumnHelper<CatalogueWithQuotes>();

// Standardized height for nested rows to keep borders perfectly aligned
const ROW_HEIGHT = "h-14";

export const RequisitionColumns = [
    columnHelper.accessor("name", {
        header: "Item Name",
        cell: (info) => (
            <div className="font-semibold text-slate-800 px-4 flex items-start pt-4 h-full">
                {info.getValue()}
            </div>
        ),
    }),

    columnHelper.display({
        id: "supplier",
        header: "Supplier",
        cell: ({ row }) => (
            <div className="flex flex-col divide-y divide-slate-100 w-full">
                {row.original.supplierQuotes.map((quote) => (
                    <div key={quote.id} className={`flex items-center ${ROW_HEIGHT} px-4 text-sm font-medium text-slate-600`}>
                        {quote.supplier}
                    </div>
                ))}
            </div>
        ),
    }),

    columnHelper.display({
        id: "standardRate",
        header: () => <div className="text-right">Price (₹)</div>,
        cell: ({ row }) => (
            <div className="flex flex-col divide-y divide-slate-100 w-full">
                {row.original.supplierQuotes.map((quote) => (
                    <div key={quote.id} className={`flex items-center justify-end ${ROW_HEIGHT} px-4 font-mono font-semibold text-slate-700`}>
                        {quote.standardRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                ))}
            </div>
        ),
    }),

    columnHelper.display({
        id: "leadTime",
        header: () => <div className="text-right">Lead Time</div>,
        cell: ({ row }) => {
            const defaultLeadTime = row.original.defaultLeadTime;
            return (
                <div className="flex flex-col divide-y divide-slate-100 w-full">
                    {row.original.supplierQuotes.map((quote) => (
                        <div key={quote.id} className={`flex items-center justify-end ${ROW_HEIGHT} px-4 font-mono text-sm text-slate-500`}>
                            {quote.leadTime ? quote.leadTime : defaultLeadTime} Days
                        </div>
                    ))}
                </div>
            );
        },
    }),

    columnHelper.display({
        id: "Quantity",
        header: () => <div className="text-center">Quantity</div>,
        cell: ({ row }) => (
            <div className="flex flex-col divide-y divide-slate-100 w-full">
                {row.original.supplierQuotes.map((quote) => (
                    <div key={quote.id} className={`flex items-center justify-center ${ROW_HEIGHT} px-4 w-40 mx-auto`}>
                        <QuantityActionRow
                            key={quote.id}
                            catalogueId={row.original.id}
                            supplierId={quote.id}
                            name={row.original.name}
                            supplierName={quote.supplier}
                            unit={row.original.unit}
                            rate={quote.standardRate}
                            variant="general"
                        />
                    </div>
                ))}
            </div>
        ),
    }),

    columnHelper.display({
        id: "TotalCost",
        header: () => <div className="text-right">Total (₹)</div>,
        cell: ({ row }) => (
            <div className="flex flex-col divide-y divide-slate-100 w-full">
                {row.original.supplierQuotes.map((quote) => {
                    return (
                        <div key={quote.id} className={`flex items-center justify-end ${ROW_HEIGHT} px-4 font-mono font-bold text-slate-800`}>
                            <TotalItemCount
                                catalogueId={row.original.id}
                                supplierId={quote.id}
                                rate={quote.standardRate}
                            />
                        </div>
                    );
                })}
            </div>
        ),
    }),
];