import { useMembership } from "@/hooks/useMembership";
import { usePendingApprovalsSummary } from "../hooks/usePendingApprovalSummary";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, CreditCard, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const PendingApprovalsSidebar = () => {
    const { data: membership } = useMembership();
    const { data: summary, isLoading } = usePendingApprovalsSummary(membership?.id);

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
        <aside className="col-span-12 lg:col-span-4 flex flex-col h-full space-y-8">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
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

                    <Card className="shadow-none p-0">
                        <div className="divide-y divide-border flex flex-col">
                            {summary?.pendingRequisitions.length === 0 ? (
                                <div className="p-4 text-xs text-center text-muted-foreground bg-muted/20">
                                    No pending material orders.
                                </div>
                            ) : (
                                summary?.pendingRequisitions.map((req) => (
                                    <Link 
                                        key={req.id} 
                                        to={`/requisitions/${req.id}`} 
                                        className="flex items-center p-3 hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0 mr-3">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {req.title}
                                            </p>
                                            <p className="font-mono text-[11px] text-muted-foreground truncate mt-0.5">
                                                ${req.amount.toLocaleString()} <span className="mx-1">•</span> {req.phaseName}
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

                    <Card className="shadow-none p-0">
                        <div className="divide-y divide-border flex flex-col">
                            {summary?.pendingPayments.length === 0 ? (
                                <div className="p-4 text-xs text-center text-muted-foreground bg-muted/20">
                                    No pending client payments.
                                </div>
                            ) : (
                                summary?.pendingPayments.map((payment) => (
                                    <Link 
                                        key={payment.id} 
                                        to={`/payments/${payment.id}`} 
                                        className="flex items-center p-3 hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0 mr-3">
                                            <CreditCard className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {payment.title}
                                            </p>
                                            <p className="font-mono text-[11px] text-muted-foreground truncate mt-0.5">
                                                ${payment.amount.toLocaleString()} <span className="mx-1">•</span> {payment.projectName}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors ml-2 shrink-0" />
                                    </Link>
                                ))
                            )}
                        </div>
                    </Card>
                </section>
                
            </div>
        </aside>
    );
};

export default PendingApprovalsSidebar;