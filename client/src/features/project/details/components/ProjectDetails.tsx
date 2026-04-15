import { useNavigate, useParams } from "react-router-dom";
import { useProjectDetails } from "../hooks/useProjectDetails";
import { format } from "date-fns";
import {
    MapPin,
    Building2,
    AlertTriangle,
    Settings,
    Activity,
    Layers,
} from "lucide-react";
import ProjectDetailsSkeleton from "./ProjectDetailsSkeleton";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

const GRID = {
    p: "p-6",
    gap: "gap-6",
    radius: "rounded-lg",
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
        case "ACTIVE": return "bg-blue-50 text-blue-700 border-blue-200";
        case "PAYMENT_PENDING": return "bg-yellow-50 text-yellow-700 border-yellow-200";
        case "PLANNING": return "bg-slate-100 text-slate-600 border-slate-200";
        default: return "bg-slate-100 text-slate-600";
    }
};

const ProjectDetails = () => {
    const navigate = useNavigate();
    const { orgSlug, projectSlug } = useParams<{ orgSlug: string; projectSlug: string; }>();
    
    const { data: project, isLoading, isError } = useProjectDetails(orgSlug, projectSlug);

    if (isLoading) return <ProjectDetailsSkeleton />;

    if (isError || !project) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] font-sans text-slate-500">
                <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
                <p className="text-lg font-medium text-slate-900">Failed to load project details</p>
            </div>
        );
    }

    
    const { budgets, phases, recentSiteLogs } = project;
    const budgetPercentage = budgets.estimatedTotal > 0
        ? Math.min((budgets.consumed / budgets.estimatedTotal) * 100, 100)
        : 0;


    return (
        <div className={`min-h-screen bg-stone-50 ${GRID.p} font-sans`}>
            
            {/* Top Bar: Project Identity & Status */}
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-serif text-slate-900 tracking-tight">
                        {project.name}
                    </h1>
                    <div className="flex items-center gap-4 text-slate-400 text-sm font-mono">
                        <span className="flex items-center gap-1.5">
                            <Building2 className="h-4 w-4" /> {project.slug}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" /> {project.address}
                        </span>
                    </div>
                </div>
                <div className="mt-4 md:mt-0">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 bg-green-700 text-white text-sm font-medium uppercase tracking-wider rounded-sm">
                            {project.status}
                        </span>
                            <button 
                                onClick={() => navigate(`settings`)}
                                className="flex items-center justify-center w-10 h-10 rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                    </div>
                </div>
            </div>

            {/* Financial Overview - Hero KPIs */}
            <div className={`grid grid-cols-1 md:grid-cols-3 ${GRID.gap} mb-6`}>
                <div className={`bg-white border border-slate-200 ${GRID.p} ${GRID.radius}`}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Estimated Total</p>
                    <p className="text-4xl font-mono text-slate-900">{formatCurrency(budgets.estimatedTotal)}</p>
                </div>
                <div className={`bg-white border border-slate-200 ${GRID.p} ${GRID.radius}`}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Consumed Budget</p>
                    <p className="text-4xl font-mono text-amber-500">{formatCurrency(budgets.consumed)}</p>
                    <p className="text-xs text-slate-400 mt-2 font-mono">{budgetPercentage.toFixed(1)}% of total</p>
                </div>
                <div className={`bg-white border border-slate-200 ${GRID.p} ${GRID.radius}`}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Remaining Budget</p>
                    <p className="text-4xl font-mono text-green-700">{formatCurrency(budgets.remaining)}</p>
                </div>
            </div>

            {/* 50/50 Split: Phases & Recent Logs */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 ${GRID.gap} mb-8`}>
                
                {/* Left: Phases List */}
                <div className={`bg-white border border-slate-200 ${GRID.p} ${GRID.radius} flex flex-col h-full`}>
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Project Phases
                    </h2>
                    
                    {phases.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-sm font-mono text-slate-400 p-8 border border-dashed border-slate-200 rounded-md bg-slate-50/50">
                            No phases created yet.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {phases.map((phase) => (
                                <div key={phase.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-md bg-stone-50 hover:border-slate-200 transition-colors">
                                    <span className="font-medium text-slate-900 text-sm">{phase.name}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusColor(phase.status)}`}>
                                        {phase.status.replace("_", " ")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Recent Site Logs */}
                <div className={`bg-white border border-slate-200 ${GRID.p} ${GRID.radius} flex flex-col h-full`}>
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Recent Activity
                    </h2>
                    
                    {recentSiteLogs.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-sm font-mono text-slate-400 border border-dashed border-slate-200 rounded-md bg-slate-50/50">
                            No recent logs recorded.
                        </div>
                    ) : (
                        <div className="flex flex-col  pl-2">
                            {recentSiteLogs.map((log) => (
                                <div key={log.id} className="relative flex flex-col gap-1 border-l-[2px] border-green-700 pl-4 py-2">
                                    <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-700 ring-4 ring-white" />
                                    <span className="text-sm font-semibold text-slate-900 leading-snug">{log.title}</span>
                                    <span className="text-xs font-mono text-slate-500">
                                        {log.authorName} • {format(new Date(log.workDate), "MMM d, yyyy")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            

        </div>
    );
};

export default ProjectDetails;