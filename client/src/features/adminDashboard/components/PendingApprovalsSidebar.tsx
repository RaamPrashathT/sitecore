import { useMembership } from "@/hooks/useMembership";
import { usePendingApprovalsSummary } from "../hooks/usePendingApprovalSummary";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const formatCurrencyINR = (amount: number) => {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

const PendingApprovalsSidebar = () => {
    const { data: membership } = useMembership();
    const { data: summary, isLoading } = usePendingApprovalsSummary(
        membership?.id,
    );

    if (isLoading) {
        return (
            <aside className="col-span-12 lg:col-span-4 space-y-6">
                <Skeleton className="h-8 w-48 mb-6" />
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
            </aside>
        );
    }

    return (
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-6 sm:pr-4 sm:p-0 p-4">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Pending Approvals
            </h2>

            <div className="space-y-6">
                {/* --- Section 1: Pending Material Orders (Requisitions) --- */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Material Orders
                        </h3>
                        <span className="text-xs font-mono font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            {summary?.pendingRequisitions.length || 0}
                        </span>
                    </div>

                    <Card className="shadow-none p-0 overflow-hidden">
                        <div className="divide-y divide-border flex flex-col">
                            {summary?.pendingRequisitions.length === 0 ? (
                                <div className="p-4 text-xs text-center text-muted-foreground bg-muted/20">
                                    No pending material orders.
                                </div>
                            ) : (
                                summary?.pendingRequisitions.map((req) => (
                                    <Link
                                        key={req.id}
                                        to={`requisitions/${req.slug}`}
                                        className="flex items-center p-3 hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {req.title}
                                            </p>
                                            <p className="font-mono text-[11px] text-muted-foreground truncate mt-0.5">
                                                {formatCurrencyINR(req.amount)}{" "}
                                                <span className="mx-1">•</span>{" "}
                                                {req.phaseName}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors ml-2 shrink-0" />
                                    </Link>
                                ))
                            )}
                        </div>
                    </Card>
                </section>

                {/* --- Section 2: Pending Phase Payments (Vendor Payments) --- */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Client Payments
                        </h3>
                        <span className="text-xs font-mono font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            {summary?.pendingPayments.length || 0}
                        </span>
                    </div>

                    <Card className="shadow-none p-0 overflow-hidden">
                        <div className="divide-y divide-border flex flex-col">
                            {summary?.pendingPayments.map((payment) => (
                                <Link
                                    key={payment.id}
                                    to={`payments/${payment.id}`} // <-- CHANGED TO .id
                                    className="flex items-center p-3 hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            {payment.title}
                                        </p>
                                        <p className="font-mono text-[11px] text-muted-foreground truncate mt-0.5">
                                            {formatCurrencyINR(payment.amount)}{" "}
                                            <span className="mx-1">•</span>{" "}
                                            {payment.projectName}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors ml-2 shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </Card>
                </section>
            </div>
        </aside>
    );
};

export default PendingApprovalsSidebar;
