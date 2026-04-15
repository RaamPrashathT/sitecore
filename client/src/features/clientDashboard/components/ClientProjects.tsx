import type { ProjectSummary } from "../hooks/useClientDashboardItem";
import { FolderOpen, Layers, TrendingUp } from "lucide-react";

interface ClientProjectsProps {
    projects: ProjectSummary[];
}

const ClientProjects = ({ projects }: ClientProjectsProps) => {
    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mb-1">
                        Portfolio
                    </p>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                        Projects
                    </h2>
                </div>
                {projects.length > 0 && (
                    <span className="text-[10px] font-mono font-semibold text-slate-400 tabular-nums">
                        {projects.length}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-3">
                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 rounded-2xl bg-slate-50 ring-1 ring-slate-200/80 text-center px-4">
                        <div className="w-10 h-10 rounded-2xl bg-white ring-1 ring-slate-200 flex items-center justify-center mb-3 shadow-sm">
                            <FolderOpen className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No active projects</p>
                        <p className="text-xs text-slate-400 mt-1">Projects will appear here once assigned</p>
                    </div>
                ) : (
                    projects.map((project) => {
                        const isActive = project.status === "ACTIVE";
                        const budgetPct =
                            project.estimatedBudget > 0
                                ? Math.min(
                                      Math.round(
                                          (project.totalOrderedCost / project.estimatedBudget) * 100,
                                      ),
                                      100,
                                  )
                                : 0;

                        let barColor = "bg-green-600";
                        if (budgetPct >= 90) barColor = "bg-red-500";
                        else if (budgetPct >= 70) barColor = "bg-amber-500";

                        return (
                            <div
                                key={project.id}
                                className={`rounded-2xl bg-white p-4 hover:shadow-md ${
                                    isActive
                                        ? "ring-1 ring-green-200 shadow-sm shadow-green-100/40"
                                        : "ring-1 ring-slate-200/80 shadow-sm"
                                }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <p className="font-bold text-[14px] text-slate-900 leading-tight truncate">
                                        {project.name}
                                    </p>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full font-mono shrink-0 ${
                                        isActive
                                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                            : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                                    }`}>
                                        {project.status}
                                    </span>
                                </div>

                                {/* Active phase */}
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="text-[11px] text-slate-500 truncate">
                                        {project.activePhase?.name || "Awaiting phase"}
                                    </span>
                                </div>

                                {/* Budget bar */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3 text-slate-400" />
                                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                                                Budget Used
                                            </span>
                                        </div>
                                        <span className="font-mono text-[11px] font-bold text-slate-700 tabular-nums">
                                            {budgetPct}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                            style={{ width: `${budgetPct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default ClientProjects;
