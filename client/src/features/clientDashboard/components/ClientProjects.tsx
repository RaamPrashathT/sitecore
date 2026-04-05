import type { ProjectSummary } from "../hooks/useClientDashboardItem";
import { FolderOpen } from "lucide-react";

interface ClientProjectsProps {
    projects: ProjectSummary[];
}

const ClientProjects = ({ projects }: ClientProjectsProps) => {
    return (
        <section>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
                    My Projects
                </h2>
                {projects.length > 0 && (
                    <span className="text-[10px] font-mono font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-full">
                        {projects.length}
                    </span>
                )}
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
                {projects.length === 0 ? (
                    <div className="rounded-xl border border-zinc-200 bg-white flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-3">
                            <FolderOpen className="w-4 h-4 text-zinc-400" />
                        </div>
                        <p className="text-sm font-medium text-zinc-500">No active projects</p>
                        <p className="text-xs text-zinc-400 mt-1">Projects assigned to you will appear here.</p>
                    </div>
                ) : (
                    projects.map((project) => {
                        const isActive = project.status === "ACTIVE";
                        const isCompleted = project.status === "COMPLETED";

                        const statusStyle = isActive
                            ? "bg-green-50 text-green-700 border-green-100"
                            : isCompleted
                            ? "bg-zinc-100 text-zinc-500 border-zinc-200"
                            : "bg-zinc-100 text-zinc-400 border-zinc-200";

                        const progressColor = isActive ? "bg-green-700" : "bg-zinc-300";

                        return (
                            <div
                                key={project.id}
                                className={`
                                    relative overflow-hidden rounded-xl border border-zinc-200 bg-white px-4 py-4
                                    transition-shadow hover:shadow-sm cursor-pointer
                                    ${!isActive ? "opacity-75" : ""}
                                `}
                            >
                                {/* Top row: name + status */}
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <h3 className={`text-sm font-semibold leading-tight truncate ${isActive ? "text-zinc-900" : "text-zinc-500"}`}>
                                        {project.name}
                                    </h3>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${statusStyle}`}>
                                        {project.status}
                                    </span>
                                </div>

                                {/* Middle row: phase + percentage */}
                                <div className="flex items-center justify-between gap-4 mb-3">
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">
                                            Active Phase
                                        </p>
                                        <p className="text-xs font-medium text-zinc-700 truncate">
                                            {project.activePhase?.name || "—"}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">
                                            Budget Used
                                        </p>
                                        <p className={`font-mono text-sm font-bold ${isActive ? "text-green-700" : "text-zinc-400"}`}>
                                            {project.completionPercentage}%
                                        </p>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${progressColor}`}
                                        style={{ width: `${Math.min(project.completionPercentage, 100)}%` }}
                                    />
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