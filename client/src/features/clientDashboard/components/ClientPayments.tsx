import type { ProcessedPendingPayment } from "../hooks/useClientDashboardItem";
import { CheckCircle2 } from "lucide-react";

interface ClientPaymentsProps {
    payments: ProcessedPendingPayment[];
}

const ClientPayments = ({ payments }: ClientPaymentsProps) => {
    if (payments.length === 0) {
        return (
            <section>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    <h2 className="font-serif text-2xl text-slate-900 tracking-tight">Payments Due</h2>
                </div>
                <div className="mt-4 rounded bg-white px-5 py-12 flex flex-col items-center text-center border border-slate-200 shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-700/30 mb-3" />
                    <p className="font-serif text-lg text-slate-900">Ledger is clear</p>
                    <p className="font-sans text-xs text-slate-500 mt-1">No pending transactions at this time.</p>
                </div>
            </section>
        );
    }

    const getBadgeStyle = (status: string) => {
        switch (status) {
            case "OVERDUE": return "bg-red-50 text-red-700 border-red-200";
            case "URGENT": return "bg-orange-50 text-orange-700 border-orange-200";
            case "DUE": return "bg-yellow-50 text-yellow-700 border-yellow-200";
            default: return "bg-emerald-50 text-emerald-700 border-emerald-200";
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex items-end justify-between mb-2 border-b border-slate-200 pb-2">
                <h2 className="font-serif text-2xl text-slate-900 tracking-tight leading-none">Payments Due</h2>
                <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-sm">
                    {payments.length} PENDING
                </span>
            </div>

            <div className="space-y-6">
                {payments.map((payment) => {
                    const isOverdue = payment.status === "OVERDUE";

                    return (
                        <div key={payment.id} className="group">
                            <div className="flex justify-between items-end mb-1.5 px-1">
                                <div>
                                    <span className="font-sans text-[9px] uppercase tracking-widest text-emerald-800 font-bold mb-0.5 block">
                                        Project: {payment.projectName}
                                    </span>
                                    <h3 className="font-serif text-xl md:text-2xl leading-tight text-slate-900">
                                        {payment.phaseName}
                                    </h3>
                                </div>
                                <span className={`px-2 py-0.5 text-[9px] font-bold tracking-tighter uppercase rounded-sm border ${getBadgeStyle(payment.status)}`}>
                                    {payment.status}
                                </span>
                            </div>

                            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm transition-all hover:shadow-md">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Deadline</span>
                                        <span className="font-mono text-sm font-medium text-slate-800">
                                            {new Date(payment.paymentDeadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Days Left</span>
                                        <span className={`font-mono text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                                            {payment.daysTillDue} <span className="text-[10px] font-sans text-slate-400">days</span>
                                        </span>
                                    </div>
                                    <div className="flex flex-col md:col-span-2 md:items-end">
                                        <span className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Amount Due</span>
                                        <span className={`font-mono text-lg md:text-xl font-bold ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                                            ₹{payment.budget.toLocaleString("en-IN")}
                                        </span>
                                    </div>
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