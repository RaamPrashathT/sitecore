import { Link } from "react-router-dom";
import type { ActionablePhase, RecentRequisition } from "../hooks/useEngineerDashboardItem";
import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/useMembership";
import {
    AlertTriangle,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    CalendarClock,
} from "lucide-react";

interface EngineerActionsProps {
    actionablePhases: ActionablePhase[];
    recentRequisitions: RecentRequisition[];
}

const RequisitionStatusIcon = ({ status }: { status: string }) => {
    if (status === "REJECTED") return <XCircle className="w-3.5 h-3.5" />;
    if (status === "PENDING_APPROVAL") return <Clock className="w-3.5 h-3.5" />;
    if (status === "APPROVED") return <CheckCircle2 className="w-3.5 h-3.5" />;
    return <FileText className="w-3.5 h-3.5" />;
};

const requisitionBadge = (status: string) => {
    if (status === "REJECTED")
        return "bg-red-50 text-red-600 ring-1 ring-red-200";
    if (status === "PENDING_APPROVAL")
        return "bg-amber-50 text-amber-600 ring-1 ring-amber-200";
    if (status === "APPROVED")
        return "bg-green-50 text-green-700 ring-1 ring-green-200";
    return "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
};

const requisitionCard = (status: string) => {
    if (status === "REJECTED")
        return "ring-1 ring-red-200 bg-white shadow-sm shadow-red-100/60";
    if (status === "PENDING_APPROVAL")
        return "ring-1 ring-amber-200 bg-white shadow-sm shadow-amber-100/40";
    if (status === "APPROVED")
        return "ring-1 ring-green-200 bg-white shadow-sm shadow-green-100/40";
    return "ring-1 ring-slate-200/80 bg-white shadow-sm";
};

const formatStatus = (status: string) =>
    status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const EngineerActions = ({ actionablePhases, recentRequisitions }: EngineerActionsProps) => {
    const { data: membership } = useMembership();

    return (
        <div className="space-y-10">

            {/* ── Action Required ─────────────────────────────────────── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mb-1">
                            Needs Attention
                        </p>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                            Action Required
                        </h2>
                    </div>
                    {actionablePhases.length > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold font-mono">
                            {actionablePhases.length}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    {actionablePhases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 rounded-2xl bg-slate-50 ring-1 ring-slate-200/80">
                            <div className="w-10 h-10 rounded-2xl bg-white ring-1 ring-slate-200 flex items-center justify-center mb-3 shadow-sm">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700">All phases covered</p>
                            <p className="text-xs text-slate-400 mt-1">Every active phase has a requisition</p>
                        </div>
                    ) : (
                        actionablePhases.map((phase) => (
                            <div
                                key={phase.phaseId}
                                className="rounded-2xl ring-1 ring-amber-200 bg-white shadow-sm shadow-amber-100/60 p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200 font-mono">
                                            <AlertTriangle className="w-2.5 h-2.5" />
                                            Needs Materials
                                        </span>
                                    </div>
                                    <p className="font-bold text-[15px] text-slate-900 truncate leading-tight">
                                        {phase.phaseName}
                                    </p>
                                    <p className="text-[12px] text-slate-500 mt-0.5 truncate">
                                        <span className="font-medium text-slate-700">{phase.projectName}</span>
                                        <span className="mx-1.5 text-slate-300">·</span>
                                        No requisition drafted yet
                                    </p>
                                </div>
                                <Link
                                    to={`/${membership?.slug}/${phase.projectSlug}/requisitions/${phase.phaseSlug}/new`}
                                    className="shrink-0"
                                >
                                    <Button
                                        size="sm"
                                        className="h-9 text-xs font-semibold px-4 bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-200 transition-all duration-150 w-full sm:w-auto"
                                    >
                                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                                        Draft Requisition
                                    </Button>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* ── Material Request Status ──────────────────────────────── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mb-1">
                            Procurement
                        </p>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                            Material Requests
                        </h2>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {recentRequisitions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 rounded-2xl bg-slate-50 ring-1 ring-slate-200/80">
                            <div className="w-10 h-10 rounded-2xl bg-white ring-1 ring-slate-200 flex items-center justify-center mb-3 shadow-sm">
                                <FileText className="w-5 h-5 text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700">No requests yet</p>
                            <p className="text-xs text-slate-400 mt-1">Submitted requisitions will appear here</p>
                        </div>
                    ) : (
                        recentRequisitions.map((req) => (
                            <div
                                key={req.id}
                                className={`rounded-2xl ${requisitionCard(req.status)} p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full font-mono ${requisitionBadge(req.status)}`}>
                                            <RequisitionStatusIcon status={req.status} />
                                            {formatStatus(req.status)}
                                        </span>
                                    </div>
                                    <p className="font-bold text-[15px] text-slate-900 truncate leading-tight">
                                        {req.title}
                                    </p>
                                    <p className="text-[12px] text-slate-500 mt-0.5 truncate">
                                        <span className="font-medium text-slate-700">{req.projectName}</span>
                                        <span className="mx-1.5 text-slate-300">·</span>
                                        {req.phaseName}
                                    </p>
                                </div>
                                <div className="shrink-0 text-left sm:text-right">
                                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mb-0.5 flex items-center gap-1 sm:justify-end">
                                        <CalendarClock className="w-3 h-3" />
                                        Submitted
                                    </p>
                                    <p className="font-mono text-sm font-semibold text-slate-700">
                                        {new Date(req.createdAt).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default EngineerActions;
