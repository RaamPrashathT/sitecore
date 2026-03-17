import { useParams } from "react-router-dom";
import { usePendingRequisitionList } from "@/hooks/usePendingRequisitionList";
import { useMembership } from "@/hooks/useMembership";
import DataTable from "@/components/pending/requisition/individualRequisition/DataTable";
import ApproveRequisitionButton from "@/components/pending/requisition/individualRequisition/ApproveRequisitionButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RejectRequisitionButton from "@/components/pending/requisition/individualRequisition/RejectRequisitionButton";

const RequisitionApprovalPage = () => {
    const { requisitionIdSlug } = useParams<{ requisitionIdSlug: string }>();

    const { data: membership } = useMembership();
    const { data: requisitions, isLoading } = usePendingRequisitionList(
        membership?.id,
    );

    if (isLoading)
        return <div className="p-8 text-center">Loading details...</div>;

    const requisition = requisitions?.find(
        (req) => req.id === requisitionIdSlug,
    );

    if (!requisition) {
        return (
            <div className="p-8 text-center text-red-500">
                Requisition not found.
            </div>
        );
    }

    return (
        <div className="p-6 max-w-8xl  flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items center justify-between w-full">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {requisition.projectName}
                        </h1>
                        <p className=" text-lg font-semibold">{requisition.phaseName}</p>
                    </div>

                    <div className="flex items-center gap-2 ">
                        <Avatar>
                            <AvatarFallback>
                                {requisition.engineer.name[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                            Requested by {requisition.engineer.name}
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">
                    Requisition Items
                </h2>
                <DataTable data={requisition.items} />
            </div>

            <div className="flex justify-between ">
                <RejectRequisitionButton requisitionId={requisition.id} />
                <ApproveRequisitionButton requisitionId={requisition.id} />
            </div>
        </div>
    );
};

export default RequisitionApprovalPage;
