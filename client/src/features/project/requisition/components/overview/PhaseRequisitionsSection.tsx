import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import type { PhaseWithRequisitions } from "../../hooks/useProjectRequisitions";
import { useProjectDetails } from "@/features/project/details/hooks/useProjectDetails";

interface PhaseRequisitionsSectionProps {
    phase: PhaseWithRequisitions;
    index: number;
    orgSlug: string;
    projectSlug: string;
}

export default function PhaseRequisitionsSection({
    phase,
    index,
    orgSlug,
    projectSlug,
}: PhaseRequisitionsSectionProps) {
    
    const { data: project, isLoading } = useProjectDetails(orgSlug, projectSlug);
    const formattedIndex = String(index + 1).padStart(2, "0");
    const isCompleted = phase.status === "COMPLETED";

    const activeRequisitions = phase.requisitions.filter(
        (req) => req.status !== "DRAFT"
    );

    const pendingCount = activeRequisitions.filter(
        (req) => req.status === "PENDING_APPROVAL"
    ).length;

    const totalItems = activeRequisitions.reduce(
        (sum, req) => sum + req.itemsCount,
        0
    );

    const getPhaseStatusStyles = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "bg-green-100 text-green-800";
            case "COMPLETED":
                return "bg-stone-200 text-stone-600";
            case "PLANNING":
            case "PAYMENT_PENDING":
            default:
                return "bg-stone-100 text-stone-600";
        }
    };

    if (isLoading || !project) {
        return 
    }
    const isProjectActive = project.status === "ACTIVE";
    return (
        <section
            className={`first:mt-0 mt-12  group ${
                isCompleted
                    ? "opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
                    : ""
            }`}
        >
            <div className="flex items-baseline justify-between mb-2 border-stone-200 pb-4">
                <div className="flex items-center gap-6">
                    <span className="font-display  text-4xl text-stone-300 leading-none">
                        {formattedIndex}
                    </span>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h2 className="font-display text-2xl font-semibold text-stone-900">
                                {phase.name}
                            </h2>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${getPhaseStatusStyles(
                                    phase.status
                                )}`}
                            >
                                {phase.status.replace("_", " ")}
                            </span>
                        </div>
                        <p className="font-sans text-xs text-stone-500 mt-1">
                            {pendingCount} Pending Requisitions • {totalItems} Items Total
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-0">
                {/* 3 evenly spaced columns */}
                <div className="grid grid-cols-3 gap-4 px-4 py-2 text-[10px] font-semibold tracking-widest text-stone-500 uppercase border-b border-stone-200">
                    <div className="text-left">Requisition Name</div>
                    <div className="text-center">Items</div>
                    <div className="text-right">Date</div>
                </div>

                {activeRequisitions.length > 0 ? (
                    activeRequisitions.map((req) => (
                        <Link
                            key={req.id}
                            to={`/${orgSlug}/${projectSlug}/requisitions/${phase.slug}/${req.slug}`}
                            className="grid grid-cols-3 gap-4 px-4 py-4 items-center hover:bg-stone-50 transition-colors duration-300 border-b border-stone-100"
                        >
                            <div className="flex flex-col text-left">
                                <span className="font-sans font-semibold text-sm text-stone-900">
                                    {req.title}
                                </span>
                            </div>
                            <div className="font-sans text-xs text-stone-500 text-center">
                                {req.itemsCount} items
                            </div>
                            <div className="font-sans text-xs text-stone-500 text-right">
                                {format(new Date(req.createdAt), "MMM dd, yyyy")}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="px-4 py-8 text-center border-b border-stone-100">
                        <p className="text-sm font-sans text-stone-400">
                            No active requisitions for this phase.
                        </p>
                    </div>
                )}
            </div>

            {(!isCompleted && isProjectActive )&& (
                <div className="mt-3 flex justify-start">
                    <Link
                        to={`/${orgSlug}/${projectSlug}/requisitions/${phase.slug}/new`}
                        className="flex items-center gap-1.5 text-green-700 hover:text-green-800 transition-colors py-2 group"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="font-sans text-xs font-semibold uppercase tracking-widest">
                            New Requisition
                        </span>
                    </Link>
                </div>
            )}
        </section>
    );
}