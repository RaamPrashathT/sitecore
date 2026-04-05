import type { ProcessedPendingPayment } from "../hooks/useClientDashboardItem";

interface ClientPaymentsProps {
    payments: ProcessedPendingPayment[];
}

const ClientPayments = ({ payments }: ClientPaymentsProps) => {
    if (payments.length === 0) {
        return (
            <section>
                <SectionHeader title="Payments Due" count={0} />
                <div className="mt-4 rounded-xl border border-zinc-200 bg-white px-5 py-8 text-center">
                    <p className="text-sm text-zinc-400">No pending payments. You're all caught up.</p>
                </div>
            </section>
        );
    }

    return (
        <section>
            <SectionHeader title="Payments Due" count={payments.length} />
            <div className="mt-4 flex flex-col gap-3">
                {payments.map((payment) => {
                    const isOverdue = payment.status === "OVERDUE";
                    const isUrgent = payment.status === "URGENT" || payment.status === "DUE";

                    return (
                        <div
                            key={payment.id}
                            className={`
                                relative overflow-hidden rounded-xl border bg-white px-5 py-4
                                flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
                                transition-shadow hover:shadow-sm
                                ${isOverdue
                                    ? "border-red-200"
                                    : isUrgent
                                    ? "border-amber-200"
                                    : "border-zinc-200"
                                }
                            `}
                        >

                            <div className="flex items-start gap-3 min-w-0">
                                

                                {/* Text */}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`
                                            text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded
                                            ${isOverdue
                                                ? "bg-red-100 text-red-600"
                                                : isUrgent
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-green-50 text-green-700"
                                            }
                                        `}>
                                            {isOverdue ? "Overdue" : payment.status === "UPCOMING" ? "Scheduled" : "Due Soon"}
                                        </span>
                                        <p className="text-sm font-semibold text-zinc-800 truncate">
                                            {payment.phaseName}
                                        </p>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        {payment.projectName}
                                        <span className="mx-1.5 text-zinc-300">·</span>
                                        Due {new Date(payment.paymentDeadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                </div>
                            </div>

                            {/* Amount */}
                            <p className={`font-mono text-xl font-bold shrink-0 sm:text-right
                                ${isOverdue ? "text-red-600" : "text-zinc-900"}
                            `}>
                                ₹{payment.budget.toLocaleString()}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

// ─── Shared section header ────────────────────────────────────────────────────

const SectionHeader = ({ title, count }: { title: string; count: number }) => (
    <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-zinc-900 tracking-tight">{title}</h2>
        {count > 0 && (
            <span className="text-[10px] font-mono font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-full">
                {count}
            </span>
        )}
    </div>
);

export default ClientPayments;