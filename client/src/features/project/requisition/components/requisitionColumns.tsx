import { createColumnHelper } from "@tanstack/react-table";
import type { CatalogueWithQuotes } from "@/hooks/useGetCatalogs";
import QuantityActionRow from "./QuantityAction";
import TotalItemCount from "./TotalItemCount";

const columnHelper = createColumnHelper<CatalogueWithQuotes>();

export const RequisitionColumns = [
    columnHelper.accessor("name", {
        header: "Item Name",
        cell: (info) => (
            <div className="font-medium flex items-center h-12 px-4">
                {info.getValue()}
            </div>
        ),
    }),

    columnHelper.display({
        id: "supplier",
        header: "Supplier",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col divide-y w-full ">
                    {row.original.supplierQuotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="flex items-center h-12 px-4 font-medium"
                        >
                            {quote.supplier}
                        </div>
                    ))}
                </div>
            );
        },
    }),

    columnHelper.display({
        id: "standardRate",
        header: "Standard Rate",
        cell: ({ row }) => {
            const unit = row.original.unit;
            return (
                <div className="flex flex-col divide-y w-full  ">
                    {row.original.supplierQuotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="flex items-center h-12 px-4 font-medium "
                        >
                            {quote.standardRate}/{unit}
                        </div>
                    ))}
                </div>
            );
        },
    }),

    columnHelper.display({
        id: "leadTime",
        header: "Lead Time",
        cell: ({ row }) => {
            const defaultLeadTime = row.original.defaultLeadTime;
            return (
                <div className="flex flex-col divide-y w-full">
                    {row.original.supplierQuotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="flex items-center h-12 px-4 font-medium"
                        >
                            {quote.leadTime ? quote.leadTime : defaultLeadTime}
                        </div>
                    ))}
                </div>
            );
        },
    }),

    columnHelper.display({
        id: "Quantity",
        header: "Quantity",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col divide-y w-full">
                    {row.original.supplierQuotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="flex items-center h-12 px-4 font-medium w-40"
                        >
                            <QuantityActionRow
                                key={quote.id}
                                catalogueId={row.original.id}
                                supplierId={quote.id}
                                name={row.original.name}
                                supplierName={quote.supplier}
                                unit={row.original.unit}
                                rate={quote.standardRate}
                            />
                        </div>
                    ))}
                </div>
            );
        },
    }),

    columnHelper.display({
        id: "Quantity",
        header: "Total Cost",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col divide-y w-full">
                    {row.original.supplierQuotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="flex items-center h-12 px-4 font-medium"
                        >
                            <TotalItemCount
                                catalogueId={row.original.id}
                                supplierId={quote.id}
                                rate={quote.standardRate}
                            />
                        </div>
                    ))}
                </div>
            );
        },
    }),
];
