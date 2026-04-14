import { useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import {
    AlertCircle,
    ChevronDown,
    ChevronRight,
    FileText,
    Loader2,
    Mail,
    ReceiptText,
    CheckCircle2,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/useMembership";
import { useProjectProgress } from "../../progress/hooks/useProjectProgress";
import {
    useGetInvoices,
    useGenerateInvoice,
    usePayInvoice,
    useSendInvoice,
    type Invoice,
} from "../hooks/useInvoices";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(n);

function calcLogTotal(log: Invoice["billedLogs"][number]) {
    return log.materialsUsed.reduce((sum, tx) => {
        return sum + Math.abs(tx.quantityChange) * tx.inventoryItem.averageUnitCost;
    }, 0);
}

// ─── Invoice Card ─────────────────────────────────────────────────────────────

function InvoiceCard({
    invoice,
    phaseId,
    isAdmin,
}: {
    invoice: Invoice;
    phaseId: string;
    isAdmin: boolean;
}) {
    const { orgSlug = "", projectSlug = "" } = useParams();
    const [expanded, setExpanded] = useState(false);

    const pay = usePayInvoice(orgSlug, projectSlug, phaseId);
    const send = useSendInvoice(orgSlug, projectSlug, phaseId);

    const isPaid = invoice.status === "PAID";

    return (
        <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
            {/* Invoice header row */}
            <div className="flex items-center justify-between px-5 py-4 gap-4">
                <button
                    onClick={() => setExpanded((p) => !p)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isPaid ? "bg-green-100" : "bg-amber-50"
                        }`}
                    >
                        {isPaid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-700" />
                        ) : (
                            <Clock className="w-4 h-4 text-amber-600" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-900 truncate">
                            Invoice #{invoice.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-stone-400 font-mono">
                            {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                            {isPaid && invoice.paidAt && (
                                <span className="ml-2 text-green-600">
                                    · Paid {format(new Date(invoice.paidAt), "MMM d, yyyy")}
                                </span>
                            )}
                        </p>
                    </div>
                </button>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-stone-900 text-sm">
                        {fmt(Number(invoice.amount))}
                    </span>
                    <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            isPaid
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-50 text-amber-700"
                        }`}
                    >
                        {invoice.status}
                    </span>

                    {isAdmin && !isPaid && (
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={pay.isPending}
                            onClick={() => pay.mutate(invoice.id)}
                            className="text-xs border-stone-200 text-stone-700 hover:bg-stone-50 h-8"
                        >
                            {pay.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                "Mark Paid"
                            )}
                        </Button>
                    )}

                    {isAdmin && (
                        <Button
                            size="sm"
                            disabled={send.isPending}
                            onClick={() => send.mutate(invoice.id)}
                            className="text-xs bg-green-700 hover:bg-green-800 text-white h-8 gap-1.5"
                        >
                            {send.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <>
                                    <Mail className="w-3 h-3" />
                                    Send to Client
                                </>
                            )}
                        </Button>
                    )}

                    <button
                        onClick={() => setExpanded((p) => !p)}
                        className="text-stone-400 hover:text-stone-700 transition-colors"
                    >
                        {expanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Expanded breakdown */}
            {expanded && (
                <div className="border-t border-stone-100 px-5 py-4 space-y-4 bg-stone-50/50">
                    {invoice.billedLogs.length === 0 ? (
                        <p className="text-sm text-stone-400 italic">No site logs attached.</p>
                    ) : (
                        invoice.billedLogs.map((log) => {
                            const logTotal = calcLogTotal(log);
                            return (
                                <div key={log.id} className="rounded-lg border border-stone-200 overflow-hidden bg-white">
                                    {/* Log header */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-100">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 text-stone-400" />
                                            <span className="text-sm font-semibold text-stone-800">
                                                {log.title}
                                            </span>
                                        </div>
                                        <span className="text-xs text-stone-400 font-mono">
                                            {format(new Date(log.workDate), "MMM d, yyyy")}
                                        </span>
                                    </div>

                                    {/* Material rows */}
                                    {log.materialsUsed.length === 0 ? (
                                        <p className="px-4 py-3 text-xs text-stone-400 italic">
                                            No materials recorded for this log.
                                        </p>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-stone-100">
                                                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                                                        Material
                                                    </th>
                                                    <th className="px-4 py-2 text-center text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                                                        Qty
                                                    </th>
                                                    <th className="px-4 py-2 text-right text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                                                        Unit Cost
                                                    </th>
                                                    <th className="px-4 py-2 text-right text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {log.materialsUsed.map((tx) => {
                                                    const qty = Math.abs(tx.quantityChange);
                                                    const unit = tx.inventoryItem.catalogue.unit;
                                                    const unitCost = tx.inventoryItem.averageUnitCost;
                                                    return (
                                                        <tr
                                                            key={tx.id}
                                                            className="border-b border-stone-50 last:border-0"
                                                        >
                                                            <td className="px-4 py-2.5 text-stone-700">
                                                                {tx.inventoryItem.catalogue.name}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-center text-stone-500 font-mono text-xs">
                                                                {qty} {unit}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right text-stone-500 font-mono text-xs">
                                                                {fmt(unitCost)}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right font-semibold text-stone-800 font-mono text-xs">
                                                                {fmt(qty * unitCost)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Log subtotal */}
                                    <div className="flex justify-end px-4 py-2.5 border-t border-stone-100 bg-stone-50">
                                        <span className="text-xs text-stone-500 mr-4">
                                            Log subtotal
                                        </span>
                                        <span className="text-sm font-bold text-green-700 font-mono">
                                            {fmt(logTotal)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Grand total */}
                    <div className="flex justify-end items-center gap-4 pt-2 border-t border-stone-200">
                        <span className="text-sm font-semibold text-stone-500">
                            Invoice Total
                        </span>
                        <span className="text-xl font-bold text-stone-900 font-mono">
                            {fmt(Number(invoice.amount))}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function getStatusDot(status: string) {
    if (status === "ACTIVE") return "bg-green-500";
    if (status === "COMPLETED") return "bg-stone-400";
    return "bg-amber-400";
}

function PhasePaymentsPanel({
    phase,
    isAdmin,
}: {
    phase: { id: string; name: string; status: string };
    isAdmin: boolean;
}) {
    const { orgSlug = "", projectSlug = "" } = useParams();
    const { data: invoices, isLoading } = useGetInvoices(orgSlug, projectSlug, phase.id);
    const generate = useGenerateInvoice(orgSlug, projectSlug);

    const canGenerate = phase.status === "ACTIVE" || phase.status === "COMPLETED";

    return (
        <div className="space-y-3">
            {/* Phase header + generate button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusDot(phase.status)}`} />
                    <h3 className="text-sm font-semibold text-stone-700">
                        {phase.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        {phase.status.replace("_", " ")}
                    </span>
                </div>

                {isAdmin && canGenerate && (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={generate.isPending}
                        onClick={() => generate.mutate(phase.id)}
                        className="text-xs border-stone-200 text-stone-700 hover:bg-stone-50 h-8 gap-1.5"
                    >
                        {generate.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <>
                                <ReceiptText className="w-3 h-3" />
                                Generate Invoice
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Invoice list */}
            {isLoading && (
                <div className="flex items-center gap-2 py-6 text-stone-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading invoices...</span>
                </div>
            )}
            {!isLoading && (!invoices || invoices.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-stone-200 rounded-xl text-stone-400">
                    <ReceiptText className="w-7 h-7 mb-2 opacity-40" />
                    <p className="text-sm font-medium">No invoices yet</p>
                    {isAdmin && canGenerate && (
                        <p className="text-xs mt-0.5">
                            Click "Generate Invoice" to bill uninvoiced site logs.
                        </p>
                    )}
                </div>
            )}
            {!isLoading && invoices && invoices.length > 0 && (
                <div className="space-y-3">
                    {invoices.map((inv) => (
                        <InvoiceCard
                            key={inv.id}
                            invoice={inv}
                            phaseId={phase.id}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentsMain() {
    const { orgSlug, projectSlug } = useParams<{
        orgSlug: string;
        projectSlug: string;
    }>();
    const { data: membership } = useMembership();
    const { data: progressData, isLoading, isError } = useProjectProgress(orgSlug, projectSlug);

    const isAdmin = membership?.role === "ADMIN";

    // Summary stats across all phases
    const phases = progressData?.phases ?? [];
    const activePhases = phases.filter((p) => p.status === "ACTIVE" || p.status === "COMPLETED");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] gap-2 text-stone-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading payments...</span>
            </div>
        );
    }

    if (isError || !progressData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
                <AlertCircle className="w-8 h-8 text-stone-400" />
                <p className="text-base font-medium text-stone-700">
                    Failed to load project data
                </p>
            </div>
        );
    }

    return (
        <main className="max-w-4xl mx-auto px-6 md:px-8 pb-32 pt-8">
            {/* Page header */}
            <div className="mb-8">
                <h1 className="font-display text-4xl text-stone-900 tracking-tight">
                    Payments
                </h1>
                <p className="text-sm text-stone-500 mt-1 font-sans">
                    Generate invoices from site log material consumption and send them to the client.
                </p>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-white border border-stone-200 rounded-xl p-5">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">
                        Total Budget
                    </p>
                    <p className="text-2xl font-mono font-bold text-stone-900">
                        {fmt(progressData.project.totalBudget)}
                    </p>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl p-5">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">
                        Total Spent
                    </p>
                    <p className="text-2xl font-mono font-bold text-green-700">
                        {fmt(progressData.project.totalSpent)}
                    </p>
                </div>
                <div className="col-span-2 md:col-span-1 bg-white border border-stone-200 rounded-xl p-5">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">
                        Active Phases
                    </p>
                    <p className="text-2xl font-mono font-bold text-stone-900">
                        {String(progressData.project.activePhasesCount).padStart(2, "0")}
                    </p>
                </div>
            </div>

            {/* Per-phase invoice sections */}
            {activePhases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-stone-200 rounded-xl text-stone-400">
                    <ReceiptText className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No active or completed phases</p>
                    <p className="text-xs mt-1">
                        Invoices can only be generated for ACTIVE or COMPLETED phases.
                    </p>
                </div>
            ) : (
                <div className="space-y-10">
                    {activePhases.map((phase) => (
                        <section key={phase.id}>
                            <PhasePaymentsPanel phase={phase} isAdmin={isAdmin} />
                        </section>
                    ))}
                </div>
            )}
        </main>
    );
}
