import { useParams } from "react-router-dom";
import { useProjectRequisitions, type RequisitionItem } from "../hooks/useProjectRequisitions";
import { Loader2, AlertCircle, CheckCircle2, Clock, XCircle, Package } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

// --- FORMATTERS & HELPERS ---
const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const getReqStatusBadge = (status: string) => {
    switch (status) {
        case "APPROVED":
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
        case "PENDING_APPROVAL":
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider"><Clock className="w-3 h-3" /> Pending</span>;
        case "REJECTED":
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider"><XCircle className="w-3 h-3" /> Rejected</span>;
        default:
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
};

const columnHelper = createColumnHelper<RequisitionItem>();
const columns = [
    columnHelper.accessor("itemName", {
        header: "Material / Item",
        cell: (info) => <span className="font-medium text-stone-900">{info.getValue()}</span>,
    }),
    columnHelper.accessor("supplierName", {
        header: "Supplier",
        cell: (info) => <span className="text-stone-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => `${row.quantity} ${row.unit}`, {
        id: "quantity",
        header: "Quantity",
        cell: (info) => <span className="font-mono text-stone-700">{info.getValue()}</span>,
    }),
    columnHelper.accessor("estimatedUnitCost", {
        header: "Unit Cost",
        cell: (info) => <span className="font-mono text-stone-700">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor((row) => row.quantity * row.estimatedUnitCost, {
        id: "total",
        header: "Total Cost",
        cell: (info) => <span className="font-mono font-medium text-stone-900">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
            <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                info.getValue() === "ORDERED" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-stone-100 text-stone-500 border border-stone-200"
            }`}>
                {info.getValue()}
            </span>
        ),
    }),
];

// --- LOCAL TABLE COMPONENT ---
const RequisitionItemsTable = ({ items }: { items: RequisitionItem[] }) => {
    const table = useReactTable({
        data: items,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="w-full overflow-hidden border border-stone-200 rounded-md bg-white">
            <table className="w-full text-sm text-left font-sans">
                <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500 font-semibold border-b border-stone-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className="px-4 py-3">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-stone-50/50 transition-colors">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
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

// --- MAIN PAGE COMPONENT ---
const ProjectRequisitionMain = () => {
    const { orgSlug, projectSlug } = useParams<{ orgSlug: string; projectSlug: string }>();
    const { data: phases, isLoading, isError } = useProjectRequisitions(orgSlug, projectSlug);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-6 h-6 animate-spin text-green-700" />
            </div>
        );
    }

    if (isError || !phases) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-stone-500">
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="font-medium text-stone-900">Failed to load requisitions</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 p-6 font-sans">
            <div className="max-w-6xl mx-auto pt-4">
                
                <div className="mb-8">
                    <h1 className="text-3xl font-serif text-stone-900 tracking-tight">Material Requisitions</h1>
                    <p className="text-sm font-sans text-stone-500 mt-2">Track requested materials, supplier assignments, and approval workflows across all project phases.</p>
                </div>

                {phases.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-stone-200 rounded-lg">
                        <Package className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                        <p className="text-stone-500 font-medium">No phases found in this project.</p>
                    </div>
                ) : (
                    <Accordion type="multiple" className="flex flex-col gap-4">
                        {phases.map((phase) => (
                            <AccordionItem 
                                key={phase.id} 
                                value={phase.id}
                                className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden data-[state=open]:ring-1 data-[state=open]:ring-green-700/20"
                            >
                                <AccordionTrigger className="px-6 py-4 hover:bg-stone-50/50 hover:no-underline transition-colors group">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-4">
                                            
                                            <div className="flex flex-col items-start text-left">
                                                <h3 className="text-base font-semibold text-stone-900 group-hover:text-green-700 transition-colors">
                                                    {phase.name}
                                                </h3>
                                                <p className="text-xs font-mono text-stone-500 mt-0.5">
                                                    {phase.requisitions.length} Requisitions • Phase Budget: {formatCurrency(phase.budget)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                
                                <AccordionContent className="px-6 pb-6 pt-2 bg-stone-50/30 border-t border-stone-100">
                                    {phase.requisitions.length === 0 ? (
                                        <p className="text-sm font-mono text-stone-400 text-center py-8">No requisitions submitted for this phase.</p>
                                    ) : (
                                        <div className="flex flex-col gap-8 mt-4">
                                            {phase.requisitions.map((req) => (
                                                <div key={req.id} className="flex flex-col gap-3">
                                                    {/* Requisition Header */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-bold text-stone-900 font-mono bg-stone-200/50 px-2 py-1 rounded">
                                                                REQ-{req.id.substring(0, 6).toUpperCase()}
                                                            </span>
                                                            {getReqStatusBadge(req.status)}
                                                        </div>
                                                        <div className="text-sm font-mono text-stone-500">
                                                            Total: <span className="font-bold text-stone-900">{formatCurrency(req.budget)}</span>
                                                        </div>
                                                    </div>

                                                    {/* TanStack Table rendering the items */}
                                                    <RequisitionItemsTable items={req.items} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </div>
    );
};

export default ProjectRequisitionMain;