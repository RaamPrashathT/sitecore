import type { ProjectSummary } from "../hooks/useClientDashboardItem";
import { FolderOpen } from "lucide-react";

interface ClientProjectsProps {
    projects: ProjectSummary[];
}

const ClientProjects = ({ projects }: ClientProjectsProps) => {
    return (
        <section className="space-y-4">
            <h3 className="font-serif text-xl mb-1 flex items-center gap-2 border-b border-slate-200 pb-2 text-slate-900">
                <FolderOpen className="w-4 h-4 text-[#006d30]" strokeWidth={2.5} />
                Project Portfolio
            </h3>

            <div className="flex flex-col gap-3">
                {projects.length === 0 ? (
                    <div className="rounded border border-dashed border-slate-200 bg-white flex flex-col items-center justify-center py-8 px-4 text-center">
                        <p className="font-sans text-xs font-medium text-slate-400 uppercase tracking-widest">No active projects</p>
                    </div>
                ) : (
                    projects.map((project) => {
                        const isActive = project.status === "ACTIVE";
                        
                        // NEW: Calculate the actual budget consumed percentage
                        const budgetUtilizedPercent = project.estimatedBudget > 0 
                            ? Math.round((project.totalOrderedCost / project.estimatedBudget) * 100) 
                            : 0;
                        
                        return (
                            <div 
                                key={project.id} 
                                className={`p-3 bg-white rounded border ${isActive ? 'border-[#006d30]/30 shadow-sm' : 'border-slate-200'} transition-all`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-slate-900 truncate pr-2">
                                        {project.name}
                                    </span>
                                    <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest shrink-0 mt-0.5">
                                        {project.status}
                                    </span>
                                </div>
                                
                                <div className="mb-1">
                                    <span className="text-[10px] text-slate-500 font-medium line-clamp-1">
                                        {project.activePhase?.name || "Awaiting Phase"}
                                    </span>
                                </div>

                                <div className="mt-3">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                            Budget Utilized
                                        </span>
                                        <span className={`font-mono text-[11px] font-bold ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                                            {/* CHANGED: Use the new variable here */}
                                            {budgetUtilizedPercent}%
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isActive ? "bg-[#006d30]" : "bg-slate-300"}`}
                                            // CHANGED: Use the new variable here to fill the bar
                                            style={{ width: `${Math.min(budgetUtilizedPercent, 100)}%` }}
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