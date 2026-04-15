import { useMembership } from "@/hooks/useMembership";
import { usePendingApprovalsSummary } from "../hooks/usePendingApprovalSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ClipboardList, CreditCard, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const formatCurrencyINR = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

const EmptyState = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
        </div>
        <p className="text-xs font-medium text-slate-500">All clear</p>
        <p className="text-[11px] text-slate-400 mt-0.5">No {label} pending</p>
    </div>
);

const PendingApprovalsSidebar = () => {
    const { data: membership } = useMembership();
    const { data: summary, isLoading } = usePendingApprovalsSummary(membership?.id);

    if (isLoading) {
        return (
            <aside className="col-span-12 lg:col-span-4 space-y-5">
                <div className="pt-2">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-3.5 w-32 mt-2" />
                </div>
                <Skeleton className="h-[200px] w-full rounded-2xl" />
                <Skeleton className="h-[200px] w-full rounded-2xl" />
            </aside>
        );
    }

    const reqCount = summary?.pendingRequisitions.length || 0;
    const payCount = summary?.pendingPayments.length || 0;
    const totalPending = reqCount + payCount;

    return (
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-6 sm:pr-4 sm:p-0 p-4">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="pt-2">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mb-1.5">
                    Awaiting Action
                </p>
                <div className="flex items-end gap-3">
                    <h2 className="text-[28px] font-bold text-slate-900 tracking-tight font-display leading-none">
                        Pending Approvals
                    </h2>
                    {totalPending > 0 && (
                        <span className="mb-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-[11px] font-bold font-mono">
                            {totalPending}
                        </span>
                    )}
                </div>
                <p className="text-[13px] text-slate-500 mt-1.5">
                    {totalPending === 0
                        ? "Nothing needs your attention"
                        : `${totalPending} item${totalPending !== 1 ? "s" : ""} need your review`}
                </p>
            </div>

            {/* ── Material Orders ─────────────────────────────────────── */}
            <section>
                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center">
                            <ClipboardList className="w-3 h-3 text-slate-500" />
                        </div>
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            Material Orders
                        </h3>
                    </div>
                    {reqCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold font-mono">
                            {reqCount}
                        </span>
                    )}
                </div>

                <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white shadow-sm shadow-slate-100/60 overflow-hidden">
                    {reqCount === 0 ? (
                        <EmptyState label="material orders" />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {summary?.pendingRequisitions.map((req) => (
                                <Link
                                    key={req.id}
                                    to={`requisitions/${req.slug}`}
                                    className="flex items-center px-4 py-3.5 hover:bg-slate-50 transition-colors duration-150 group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-slate-800 truncate leading-snug">
                                            {req.title}
                                        </p>
                                        <p className="font-mono text-[11px] text-slate-400 truncate mt-0.5">
                                            <span className="text-slate-600 font-semibold">{formatCurrencyINR(req.amount)}</span>
                                            <span className="mx-1.5 text-slate-200">·</span>
                                            {req.phaseName}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors ml-3 shrink-0" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Client Payments ─────────────────────────────────────── */}
            <section>
                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center">
                            <CreditCard className="w-3 h-3 text-slate-500" />
                        </div>
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            Client Payments
                        </h3>
                    </div>
                    {payCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold font-mono">
                            {payCount}
                        </span>
                    )}
                </div>

                <div className="rounded-2xl ring-1 ring-slate-200/80 bg-white shadow-sm shadow-slate-100/60 overflow-hidden">
                    {payCount === 0 ? (
                        <EmptyState label="client payments" />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {summary?.pendingPayments.map((payment) => (
                                <Link
                                    key={payment.id}
                                    to={`payments/${payment.id}`}
                                    className="flex items-center px-4 py-3.5 hover:bg-slate-50 transition-colors duration-150 group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-slate-800 truncate leading-snug">
                                            {payment.title}
                                        </p>
                                        <p className="font-mono text-[11px] text-slate-400 truncate mt-0.5">
                                            <span className="text-slate-600 font-semibold">{formatCurrencyINR(payment.amount)}</span>
                                            <span className="mx-1.5 text-slate-200">·</span>
                                            {payment.projectName}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors ml-3 shrink-0" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

        </aside>
    );
};

export default PendingApprovalsSidebar;
