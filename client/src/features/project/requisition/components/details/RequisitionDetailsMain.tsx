import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { usePhaseAllRequisitions, type RequisitionItemDetail } from "../../hooks/usePhaseAllRequisitions";

const columnHelper = createColumnHelper<RequisitionItemDetail>();

const columns = [
    columnHelper.accessor("itemName", {
        header: "Item Description",
        cell: (info) => (
            <div className="flex flex-col py-3 px-4">
                <span className="text-stone-900 font-medium">{info.getValue()}</span>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider mt-0.5">
                    {info.row.original.category}
                </span>
            </div>
        ),
    }),
    columnHelper.accessor("quantity", {
        header: () => <div className="text-center">Qty</div>,
        cell: (info) => (
            <div className="text-center font-medium text-stone-900 py-3">{info.getValue()}</div>
        ),
    }),
    columnHelper.accessor("unit", {
        header: "Unit",
        cell: (info) => <div className="text-stone-500 py-3">{info.getValue()}</div>,
    }),
    columnHelper.accessor("supplierName", {
        header: "Supplier",
        cell: (info) => <div className="text-stone-500 py-3">{info.getValue()}</div>,
    }),
    columnHelper.accessor("totalEstimatedCost", {
        header: () => <div className="text-right pr-4">Cost (₹)</div>,
        cell: (info) => (
            <div className="text-right font-medium text-stone-900 py-3 pr-4">
                {info.getValue().toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </div>
        ),
    }),
];

// Sub-component to cleanly render TanStack table for each requisition loop
const RequisitionTable = ({ items }: { items: RequisitionItemDetail[] }) => {
    const table = useReactTable({
        data: items,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="bg-stone-50 border-y border-stone-200">
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className="py-3 text-[10px] font-semibold uppercase tracking-widest text-stone-500 first:pl-4 last:pr-4">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="text-sm divide-y divide-stone-100">
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-stone-50 transition-colors">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="py-1">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const RequisitionDetailsMain = () => {
    const { orgSlug, projectSlug, phaseSlug } = useParams<{
        orgSlug: string;
        projectSlug: string;
        phaseSlug: string;
    }>();

    const { data: phaseData, isLoading, isError } = usePhaseAllRequisitions(orgSlug, projectSlug, phaseSlug);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner className="text-emerald-700" />
            </div>
        );
    }

    if (isError || !phaseData) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-red-500 font-mono">
                ERR: Failed to load phase requisitions. Check backend logs!
            </div>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-6 pb-24 pt-8 font-sans">
            <div className="mb-10">
                <Link
                    to={`/${orgSlug}/${projectSlug}/requisitions`}
                    className="text-stone-500 hover:text-stone-900 flex items-center gap-2 text-sm font-medium transition-colors w-fit"
                >
                    <ArrowLeft size={16} />
                    Back to Phases
                </Link>
            </div>


            <div className="space-y-12">
                {phaseData.requisitions.length === 0 ? (
                    <div className="text-center py-20 bg-stone-50 rounded-xl border border-stone-200">
                        <p className="text-stone-500 font-medium">No requisitions generated for this phase yet.</p>
                    </div>
                ) : (
                    phaseData.requisitions.map(req => (
                        <section key={req.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                            {/* Requisition Card Header */}
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="font-display  text-2xl text-stone-900">{req.slug.toUpperCase()}</h2>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold ${
                                            req.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" :
                                            req.status === "REJECTED" ? "bg-red-100 text-red-800" :
                                            req.status === "DRAFT" ? "bg-stone-200 text-stone-700" :
                                            "bg-amber-100 text-amber-800"
                                        }`}>
                                            {req.status.replace("_", " ")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-500 font-medium">{format(new Date(req.createdAt), 'MMM dd, yyyy')}</p>
                                </div>
                                <div className="md:text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Total Cost</p>
                                    <p className="font-display text-xl text-emerald-800 font-bold tracking-tight">₹{req.budget.toLocaleString("en-IN")}</p>
                                </div>
                            </div>
                            
                            {/* Requisition Table */}
                            <RequisitionTable items={req.items} />
                            
                            {/* Requisition Card Footer */}
                            <div className="bg-stone-50/50 p-4 border-t border-stone-100 flex justify-end">
                                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">{req.items.length} Items Listed</p>
                            </div>
                        </section>
                    ))
                )}
            </div>
        </main>
    );
};

export default RequisitionDetailsMain;