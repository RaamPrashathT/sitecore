import { useParams } from "react-router-dom";
import { useGetPhaseDetails } from "../hooks/useGetPhaseDetails";
import PhaseSnapshot from "./PhaseSnapshot";
import RequisitionList from "./RequisitionList";
import SiteLogFeed from "./SiteLogFeed";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function ProjectPhaseDetails({
    phaseId,
}: {
    readonly phaseId: string;
}) {
    const { projectSlug } = useParams();
    const { data: member } = useMembership();

    const { data, isLoading, isError } = useGetPhaseDetails(
        phaseId,
        projectSlug,
        member?.id,
    );

    if (isLoading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
                <span className="text-slate-500 text-sm">
                    Loading phase data…
                </span>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="p-4 text-sm text-red-600">
                Unable to load data for this phase.
            </div>
        );
    }

    return (
        <>
            <div className="hidden lg:flex w-full h-[70vh]">
                <ResizablePanelGroup
                    orientation="horizontal"
                    className="w-full h-full rounded-none border-none"
                >
                    <ResizablePanel
                        defaultSize="40%"
                        minSize="35%"
                        className="overflow-hidden"
                    >
                        <div className="h-full overflow-x-hidden px-4">
                            <SiteLogFeed logs={data.siteLogs} />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="bg-slate-100 w-px mx-2" />

                    <ResizablePanel
                        defaultSize="60%"
                        minSize="35%"
                        className="overflow-hidden"
                    >
                        <div className="h-full overflow-y-auto overflow-x-hidden pl-4 flex flex-col gap-6">
                            <RequisitionList
                                requisitions={data.requisitions}
                                phaseId={phaseId}
                            />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>

            <div className="flex lg:hidden flex-col gap-6">
                <SiteLogFeed logs={data.siteLogs} />
                <PhaseSnapshot
                    snapshot={data.phaseSnapshot}
                    logCount={data.siteLogs.length}
                />
                <RequisitionList
                    requisitions={data.requisitions}
                    phaseId={phaseId}
                />
            </div>
        </>
    );
}
