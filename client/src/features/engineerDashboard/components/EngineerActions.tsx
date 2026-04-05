import { Link } from "react-router-dom";
import type { ActionablePhase, RecentRequisition } from "../hooks/useEngineerDashboardItem";
import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/useMembership";
import { AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

interface EngineerActionsProps {
    actionablePhases: ActionablePhase[];
    recentRequisitions: RecentRequisition[];
}

const EngineerActions = ({ actionablePhases, recentRequisitions }: EngineerActionsProps) => {
    const { data: membership } = useMembership();

    return (
        <div className="space-y-10">
            {/* ALERT SECTION: Actionable Phases */}
            <section className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Action Required</h2>
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded">
                        {actionablePhases.length} Tasks
                    </span>
                </div>
                
                <div className="space-y-4">
                    {actionablePhases.length === 0 ? (
                        <div className="bg-card p-6 rounded-xl border border-border text-center text-muted-foreground text-sm">
                            All active phases have drafted requisitions.
                        </div>
                    ) : (
                        actionablePhases.map((phase) => (
                            <div key={phase.phaseId} className="p-6 rounded-xl border-2 border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all hover:border-amber-500/60">
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Needs Materials
                                        </span>
                                        <span className="font-semibold text-foreground truncate">{phase.phaseName}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {phase.projectName} • Phase is active but no requisition has been created.
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <Link to={`/${membership?.slug}/${phase.projectSlug}/requisitions/${phase.phaseSlug}/new`}>
                                        <Button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm">
                                            Draft Requisition
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* TRACKER SECTION: Recent Material Orders */}
            <section className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Material Request Status</h2>
                </div>

                <div className="space-y-4">
                    {recentRequisitions.length === 0 ? (
                        <div className="bg-card p-6 rounded-xl border border-border text-center text-muted-foreground text-sm">
                            No recent material requests submitted.
                        </div>
                    ) : (
                        recentRequisitions.map((req) => {
                            const isRejected = req.status === "REJECTED";
                            const isPending = req.status === "PENDING_APPROVAL";

                            const cardStyle = isRejected 
                                ? "border-destructive/30 bg-destructive/5" 
                                : isPending 
                                    ? "border-amber-500/20 bg-card" 
                                    : "border-green-500/30 bg-green-500/5";

                            const badgeStyle = isRejected 
                                ? "bg-destructive/10 text-destructive border-destructive/20" 
                                : isPending 
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                                    : "bg-green-500/10 text-green-700 border-green-500/20";

                            const Icon = isRejected ? XCircle : isPending ? Clock : CheckCircle2;

                            return (
                                <div key={req.id} className={`p-5 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${cardStyle}`}>
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${badgeStyle}`}>
                                                <Icon className="w-3 h-3" /> {req.status.replace("_", " ")}
                                            </span>
                                            <span className="font-semibold text-foreground truncate">{req.title}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {req.projectName} • {req.phaseName}
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Submitted</p>
                                        <p className="font-mono text-sm font-medium text-foreground">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
    );
};

export default EngineerActions;