import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useMembership } from "@/hooks/useMembership";
import type { PhaseListType } from "@/hooks/usePhaseList";
import api from "@/lib/axios";
import { getDeadlineStatus } from "@/utils/dateConverter";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
const PhaseList = ({ phases }: { phases: PhaseListType[] }) => {
    const navigate = useNavigate();
    const { data: membership, isLoading: membershipLoading } = useMembership();
    if (!Array.isArray(phases)) {
        return <p>No phases found.</p>;
    }
    const handleCreateRequisition = async ({
        phaseId,
        budget,
        projectId
    }: {
        phaseId: string;
        budget: number;
        projectId: string;
    }) => {
        try {
            const response = await api.post("/project/phase/requisition", {
                phaseId,
                budget,
            }, {
                headers: {
                    "x-organization-id": membership?.id,
                    "x-project-id": projectId
                }
            
            })
            navigate(`requisition/${response.data.id}`)
        } catch (error) {
            console.error("Error creating requisition:", error);
        }
    };
    if (membershipLoading) {
        return <div>Loading...</div>;
    }
    if (!membership) {
        return <div>No access</div>;
    }
    return (
        <div className="p-6 ">
            <Accordion
                type="multiple"
                defaultValue={["Phase"]}
                className="rounded-lg border w-full"
            >
                {phases.map((phase) => (
                    <AccordionItem
                        value={phase.id}
                        key={phase.id}
                        className="border-b px-4 last:border-b-0 "
                    >
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex w-full justify-between items-center">
                                <p className="text-xl font-semibold ">
                                    {phase.name}
                                </p>
                                <Badge className="capitalize">
                                    {phase.status.toLowerCase()}
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-y-4">
                            {phase.description && (
                                <div>
                                    <p className="font-semibold text-gray-600">
                                        Description:
                                    </p>
                                    <p>{phase.description}</p>
                                </div>
                            )}
                            <div className="flex text-xl font-semibold gap-x-1">
                                <p className="">Budget:</p>
                                <p>{phase.budget}</p>
                            </div>
                            {phase.status === "PAYMENT_PENDING" && (
                                <div className="flex text-xl font-semibold gap-x-2 items-center">
                                    <p>Due Date:</p>
                                    <span
                                        className={
                                            getDeadlineStatus(
                                                phase.paymentDeadline,
                                            ).color
                                        }
                                    >
                                        {
                                            getDeadlineStatus(
                                                phase.paymentDeadline,
                                            ).message
                                        }
                                    </span>
                                </div>
                            )}
                            {phase.status === "ACTIVE" && (
                                <button
                                    className="flex justify- items-center gap-x-2"
                                    onClick={() =>
                                        handleCreateRequisition({
                                            phaseId: phase.id,
                                            budget: phase.budget,
                                            projectId: phase.projectId
                                        })
                                    }
                                >
                                    <Plus className="size-5" />
                                    <p>Add Requisitions</p>
                                </button>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default PhaseList;
