import type { PhaseDetailsSchema } from "../hooks/useGetPhaseDetails";

interface PhaseSnapshotProps {
    snapshot: PhaseDetailsSchema["phaseSnapshot"] & { formattedBudget?: string, formattedSpent?: string, progressPercentage?: number };
    logCount: number;
}

export default function PhaseSnapshot({ snapshot, logCount }: PhaseSnapshotProps) {
    return (
        <div className="bg-white">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Details:</h2>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <span className="block text-sm font-medium text-slate-600 mb-1">Budget</span>
                    <span className="block text-2xl font-bold text-slate-900">{snapshot.formattedBudget || `₹${snapshot.budget}`}</span>
                    <span className="block text-sm text-slate-500 mt-0.5">{snapshot.formattedSpent || '₹0'} spent</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <span className="block text-sm font-medium text-slate-600 mb-1">Progress</span>
                    <span className="block text-2xl font-bold text-green-700">{snapshot.progressPercentage || 0}%</span>
                    <span className="block text-sm text-slate-500 mt-0.5">{logCount} Site Logs</span>
                </div>
            </div>

            {snapshot.isOverdue && (
                <div className="mt-4 p-3.5 rounded-lg bg-red-50 border border-red-200">
                    <span className="block font-semibold text-red-800">Payment Overdue</span>
                    <span className="block text-sm text-red-600 mt-0.5">
                        Due {new Date(snapshot.paymentDeadline).toLocaleDateString()}
                    </span>
                </div>
            )}
        </div>
    );
}