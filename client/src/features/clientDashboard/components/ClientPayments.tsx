import type { ProcessedPendingPayment } from "../hooks/useClientDashboardItem";
import {
    CheckCircle2,
    AlertTriangle,
    Clock,
    XCircle,
    CalendarDays,
    IndianRupee,
} from "lucide-react";

interface ClientPaymentsProps {
    payments: ProcessedPendingPayment[];
}

const statusConfig = (status: string) => {
    switch (status) {
        case "OVERDUE":
            return {
                badge: "bg-red-50 text-red-600 ring-1 ring-red-200",
                card: "ring-1 ring-red-200 shadow-sm shadow-red-100/60",
                numColor: "text-red-600",
                icon: <XCircle className="w-2.5 h-2.5" />,
                label: "Overdue",
            };
        case "URGENT":
            return {
                badge: "bg-orange-50 text-orange-600 ring-1 ring-orange-200",
                card: "ring-1 ring-orange-200 shadow-sm shadow-orange-100/40",
                numColor: "text-orange-600",
                icon: <AlertTriangle className="w-2.5 h-2.5" />,
                label: "Urgent",
            };
        case "DUE":
            return {
                badge: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
                card: "ring-1 ring-amber-200 shadow-sm shadow-amber-100/40",
                numColor: "text-amber-600",
                icon: <Clock className="w-2.5 h-2.5" />,
                label: "Due Soon",
            };
        default:
            return {
                badge: "bg-green-50 text-green-700 ring-1 ring-green-200",
                card: "ring-1 ring-slate-200/80 shadow-sm",
                numColor: "text-slate-800",
                icon: <CheckCircle2 className="w-2.5 h-2.5" />,
                label: "Upcoming",
            };
    }
};

const ClientPayments = ({ payments }: ClientPaymentsProps) => {
    if (payments.length === 0) {
        return (
            <section>
                <div className="mb-4">
                    <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mb-1">
                        Financials
                    </p>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                        Payments Due
                    </h2>
                </div>
                <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-slate-50 ring-1 ring-slate-200/80 text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-white ring-1 ring-slate-200 flex items-center justify-center mb-4 shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">No pending transactions at this time</p>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mb-1">
                        Financials
                    </p>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                        Payments Due
                    </h2>
                </div>
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-red-100 text-red-600 text-[11px] font-bold font-mono">
                    {payments.length}
                </span>
            </div>

            <div className="flex flex-col gap-3">
                {payments.map((payment) => {
                    const cfg = statusConfig(payment.status);

                    return (
                        <div
                            key={payment.id}
                            className={`rounded-2xl ${cfg.card} bg-white p-5`}
                        >
                            {/* Title row */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full font-mono ${cfg.badge}`}>
                                            {cfg.icon}
                                            {cfg.label}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-[16px] text-slate-900 leading-tight truncate">
                                        {payment.phaseName}
                                    </h3>
                                    <p className="text-[12px] text-slate-500 mt-0.5">
                                        <span className="font-medium text-slate-700">{payment.projectName}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-3 gap-2.5">
                                {/* Deadline */}
                                <div className="flex flex-col gap-1 bg-slate-50 rounded-xl px-3.5 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarDays className="w-3 h-3 text-slate-400" />
                                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                                            Deadline
                                        </span>
                                    </div>
                                    <p className="font-mono font-bold text-[13px] text-slate-800 leading-snug">
                                        {new Date(payment.paymentDeadline).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono">
                                        {new Date(payment.paymentDeadline).getFullYear()}
                                    </p>
                                </div>

                                {/* Days left */}
                                <div className={`flex flex-col gap-1 rounded-xl px-3.5 py-3 ${
                                    payment.status === "OVERDUE"
                                        ? "bg-red-50"
                                        : payment.status === "URGENT"
                                        ? "bg-orange-50"
                                        : payment.status === "DUE"
                                        ? "bg-amber-50"
                                        : "bg-slate-50"
                                }`}>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className={`w-3 h-3 ${cfg.numColor}`} />
                                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                                            Days Left
                                        </span>
                                    </div>
                                    <p className={`font-mono font-bold text-xl leading-none tabular-nums ${cfg.numColor}`}>
                                        {Math.abs(payment.daysTillDue)}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono">
                                        {payment.daysTillDue < 0 ? "overdue" : "remaining"}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="flex flex-col gap-1 bg-slate-50 rounded-xl px-3.5 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <IndianRupee className="w-3 h-3 text-slate-400" />
                                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                                            Amount Due
                                        </span>
                                    </div>
                                    <p className={`font-mono font-bold text-xl leading-none tabular-nums ${
                                        payment.status === "OVERDUE" ? "text-red-600" : "text-slate-800"
                                    }`}>
                                        ₹{(payment.budget / 100000).toFixed(1)}L
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono">
                                        {payment.budget.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default ClientPayments;
