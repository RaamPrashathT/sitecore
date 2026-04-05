import type { ActiveProject } from "../hooks/useEngineerDashboardItem";

interface EngineerProjectsProps {
    projects: ActiveProject[];
}

const EngineerProjects = ({ projects }: EngineerProjectsProps) => {
    return (
        <section className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight text-foreground">My Active Projects</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                {projects.length === 0 ? (
                    <div className="bg-card p-6 rounded-xl border border-border text-center text-muted-foreground text-sm">
                        You are not currently assigned to any active projects.
                    </div>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="bg-card p-5 rounded-xl border-l-4 border-l-primary shadow-sm hover:translate-x-1 transition-transform cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-foreground truncate">{project.name}</h3>
                                </div>
                                <span className="text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter bg-primary/10 text-primary shrink-0">
                                    ACTIVE
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm mt-2">
                                <div className="flex-1">
                                    <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">Current Phase</p>
                                    <p className="font-semibold text-foreground truncate">
                                        {project.activePhase?.name || "N/A"}
                                    </p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">Phase Deadline</p>
                                    <p className="font-mono font-medium text-foreground truncate">
                                        {project.activePhase?.deadline ? new Date(project.activePhase.deadline).toLocaleDateString() : "Unscheduled"}
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