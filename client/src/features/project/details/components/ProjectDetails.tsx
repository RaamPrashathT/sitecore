import { useNavigate, useParams } from "react-router-dom";
import { useProjectDetails } from "../hooks/useProjectDetails";
import {
    MapPin,
    Building2,
    AlertTriangle,
    Users,
    Camera,
    ClipboardList,
    Settings,
} from "lucide-react";
import ProjectDetailsSkeleton from "./ProjectDetailsSkeleton";

// Updated to Indian Rupees (INR)
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

const ProjectDetails = () => {
    const navigate = useNavigate();
    const { orgSlug, projectSlug } = useParams<{
        orgSlug: string;
        projectSlug: string;
    }>();
    const {
        data: project,
        isLoading,
        isError,
    } = useProjectDetails(orgSlug, projectSlug);

    if (isLoading) {
        return <ProjectDetailsSkeleton />;
    }

    if (isError || !project) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] font-sans text-slate-500">
                <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
                <p className="text-lg font-medium text-slate-900">
                    Failed to load project details
                </p>
            </div>
        );
    }

    const { budgets, phasePipeline } = project;
    const budgetPercentage =
        budgets.estimatedTotal > 0
            ? Math.min((budgets.consumed / budgets.estimatedTotal) * 100, 100)
            : 0;

    const dynamicStats = {
        burnRate: null,
        daysActive: null,
        scheduleAdherence: "Pending",
        projectedOverage: "Pending",
        activeWorkOrders: null,
        onSiteCrew: null,
        riskFlags: null,
        progressPhotos: null,
    };

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
                    <div className="flex">
                        <span className="inline-flex items-center px-3 py-1 bg-green-700 text-white text-sm font-medium uppercase tracking-wider rounded-sm">
                            {project.status}
                        </span>
                        <button 
                        onClick={() => navigate(`settings`)}
                        className="flex items-center justify-center w-10 h-10 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Financial Overview - Hero KPIs */}
            <div className={`grid grid-cols-1 md:grid-cols-3 ${GRID.gap} mb-6`}>
                <div
                    className={`bg-white border border-slate-200 ${GRID.p} ${GRID.radius}`}
                >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                        Estimated Total
                    </p>
                    <p className="text-4xl font-mono text-slate-900">
                        {formatCurrency(budgets.estimatedTotal)}
                    </p>
                    <p className="text-sm text-slate-400 mt-2 font-mono">
                        Base contract value
                    </p>
                </div>
                <div
                    className={`bg-white border border-slate-200 ${GRID.p} ${GRID.radius}`}
                >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                        Consumed Budget
                    </p>
                    <p className="text-4xl font-mono text-amber-500">
                        {formatCurrency(budgets.consumed)}
                    </p>
                    <p className="text-sm text-slate-400 mt-2 font-mono">
                        {budgetPercentage.toFixed(1)}% of total
                    </p>
                </div>
                <div
                    className={`bg-white border border-slate-200 ${GRID.p} ${GRID.radius}`}
                >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                        Remaining Budget
                    </p>
                    <p className="text-4xl font-mono text-green-700">
                        {formatCurrency(budgets.remaining)}
                    </p>
                    <p className="text-sm text-slate-400 mt-2 font-mono">
                        Available funds
                    </p>
                </div>
            </div>

            {/* Middle Section: Budget Utilization & Phase Pipeline */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 ${GRID.gap} mb-6`}>
                {/* Budget Utilization Panel */}
                <div
                    className={`lg:col-span-2 bg-white border border-slate-200 ${GRID.p} ${GRID.radius}`}
                >
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">
                        Budget Utilization
                    </h2>

                    <div className="mb-8">
                        <div className="flex justify-between text-sm font-mono text-slate-500 mb-2">
                            <span>{budgetPercentage.toFixed(1)}% consumed</span>
                            <span>
                                {formatCurrency(budgets.consumed)} of{" "}
                                {formatCurrency(budgets.estimatedTotal)}
                            </span>
                        </div>
                        <div className="relative h-2 w-full bg-slate-200 rounded-sm overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-amber-500"
                                style={{ width: `${budgetPercentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
                            <span>₹0</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <div className={`grid grid-cols-2 ${GRID.gap}`}>
                        <div className="bg-stone-50 p-4 border border-slate-100 rounded-sm">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Burn Rate / Day
                            </p>
                            <p className="text-lg font-mono text-slate-900">
                                {dynamicStats.burnRate
                                    ? formatCurrency(dynamicStats.burnRate)
                                    : "--"}
                            </p>
                        </div>
                        <div className="bg-stone-50 p-4 border border-slate-100 rounded-sm">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Projected Overage
                            </p>
                            <p className="text-lg font-sans text-slate-500 font-medium">
                                {dynamicStats.projectedOverage}
                            </p>
                        </div>
                        <div className="bg-stone-50 p-4 border border-slate-100 rounded-sm">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Days Active
                            </p>
                            <p className="text-lg font-mono text-slate-900">
                                {dynamicStats.daysActive ?? "--"}
                            </p>
                        </div>
                        <div className="bg-stone-50 p-4 border border-slate-100 rounded-sm">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Schedule Adherence
                            </p>
                            <p className="text-lg font-sans text-slate-500 font-medium">
                                {dynamicStats.scheduleAdherence}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Phase Pipeline */}
                <div
                    className={`bg-white border border-slate-200 ${GRID.p} ${GRID.radius}`}
                >
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">
                        Phase Pipeline
                    </h2>
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-slate-300 mt-1.5" />
                                <div className="w-0.5 h-12 bg-slate-200 mt-2" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-sans font-medium text-slate-900">
                                        Planning
                                    </span>
                                    <span className="text-xs font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded-sm">
                                        {phasePipeline.PLANNING}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 rounded-sm">
                                    <div className="h-full bg-slate-300 w-full rounded-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-yellow-400 mt-1.5" />
                                <div className="w-0.5 h-12 bg-slate-200 mt-2" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-sans font-medium text-slate-900">
                                        Payment Pending
                                    </span>
                                    <span className="text-xs font-mono text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-sm">
                                        {phasePipeline.PAYMENT_PENDING}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 rounded-sm">
                                    <div className="h-full bg-yellow-400 w-full rounded-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-green-700 mt-1.5" />
                                <div className="w-0.5 h-12 bg-slate-200 mt-2" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-sans font-medium text-slate-900">
                                        Active
                                    </span>
                                    <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded-sm">
                                        {phasePipeline.ACTIVE}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 rounded-sm">
                                    <div className="h-full bg-green-700 w-[60%] rounded-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-green-400 mt-1.5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-sans font-medium text-slate-900">
                                        Completed
                                    </span>
                                    <span className="text-xs font-mono text-green-800 bg-green-100 px-2 py-0.5 rounded-sm">
                                        {phasePipeline.COMPLETED}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 rounded-sm">
                                    <div className="h-full bg-green-400 w-full rounded-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Operational Panels (Awaiting Backend) */}
            <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${GRID.gap}`}
            >
                <div className="bg-white border border-slate-200 p-5 rounded-lg flex items-start gap-4">
                    <div className="p-3 bg-stone-50 rounded-sm border border-slate-100">
                        <ClipboardList className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Active Work Orders
                        </p>
                        <p className="text-2xl font-mono text-slate-900">
                            {dynamicStats.activeWorkOrders ?? "--"}
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-lg flex items-start gap-4">
                    <div className="p-3 bg-stone-50 rounded-sm border border-slate-100">
                        <Users className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            On-site Crew
                        </p>
                        <p className="text-2xl font-mono text-slate-900">
                            {dynamicStats.onSiteCrew ?? "--"}
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-lg flex items-start gap-4">
                    <div className="p-3 bg-stone-50 rounded-sm border border-slate-100">
                        <AlertTriangle className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Risk Flags
                        </p>
                        <p className="text-2xl font-mono text-slate-900">
                            {dynamicStats.riskFlags ?? "--"}
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-lg flex items-start gap-4">
                    <div className="p-3 bg-stone-50 rounded-sm border border-slate-100">
                        <Camera className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Progress Photos
                        </p>
                        <p className="text-2xl font-mono text-slate-900">
                            {dynamicStats.progressPhotos ?? "--"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
