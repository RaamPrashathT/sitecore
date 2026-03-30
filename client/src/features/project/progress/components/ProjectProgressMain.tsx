import { useState, useEffect } from "react";
import { useGetProjectProgress } from "../hooks/useGetProjectProgress";
import ProgressTimeline from "./ProjectProgressTimeline";
import ProjectPhaseDetails from "./ProjectPhaseDetails";

export default function ProjectProgressMain() {
    const { data, isLoading, isError } = useGetProjectProgress();
    const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
    
    useEffect(() => {
        if (data?.phases && !selectedPhaseId) {
            const lastActive = [...data.phases].reverse().find(
                p => p.status === "ACTIVE" || p.status === "PAYMENT_PENDING"
            );
            
            const lastCompleted = [...data.phases].reverse().find(
                p => p.status === "COMPLETED"
            );

            setSelectedPhaseId(lastActive?.id || lastCompleted?.id || data.phases[0]?.id || null);
        }
    }, [data, selectedPhaseId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
                <div className="w-8 h-8 border-4 border-green-100 border-t-green-700 rounded-full animate-spin" />
                <span className="text-slate-700 font-medium">Loading project timeline...</span>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="p-5 border border-red-200 bg-red-50 rounded-lg flex items-start">
                <span className="text-red-800 font-medium">Unable to load project progress. Please refresh.</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto ">
            <div className="bg-white px-2 pt-2 my-4">
                <ProgressTimeline
                    phases={data.phases}
                    selectedPhaseId={selectedPhaseId}
                    onSelectPhase={setSelectedPhaseId}
                />
            </div>

            {selectedPhaseId && (
                <ProjectPhaseDetails phaseId={selectedPhaseId} />
            )}
        </div>
    );
}