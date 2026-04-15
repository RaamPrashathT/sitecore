import type { ActiveProject } from "../hooks/useEngineerDashboardItem";
import { FolderOpen, Layers } from "lucide-react";

interface EngineerProjectsProps {
    projects: ActiveProject[];
}

const EngineerProjects = ({ projects }: EngineerProjectsProps) => {
    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mb-1">
                        Assigned
                    </p>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                        Active Projects
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
                        <p className="text-xs text-slate-400 mt-1">You haven't been assigned to any projects yet</p>
                    </div>
                ) : (
                    projects.map((project) => (
                        <div
                            key={project.id}
                            className="rounded-2xl ring-1 ring-slate-200/80 bg-white shadow-sm p-5 cursor-pointer"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <h3 className="font-bold text-[15px] text-slate-900 leading-tight truncate">
                                    {project.name}
                                </h3>
                                <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-50 text-green-700 ring-1 ring-green-200 font-mono shrink-0">
                                    Active
                                </span>
                            </div>

                            {/* Phase info */}
                            <div className="">
                                <div className="flex flex-col gap-1 bg-slate-50 rounded-xl px-3 py-2.5">
                                    <div className="flex items-center gap-1.5">
                                        <Layers className="w-3 h-3 text-slate-400" />
                                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                                            Current Phase
                                        </span>
                                    </div>
                                    <p className="font-semibold text-[13px] text-slate-800 leading-snug truncate">
                                        {project.activePhase?.name || "—"}
                                    </p>
                                </div>

                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default EngineerProjects;
