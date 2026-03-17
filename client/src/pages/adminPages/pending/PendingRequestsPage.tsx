import PhasePaymentApprovalForm from "@/components/pending/phase/PhasePaymentApprovalForm";
import PendingRequisitionApprovalForm from "@/components/pending/requisition/RequisitionApprovalForm";

const PendingRequestsPage = () => {
    return (
        <div>
            <div>
                <h1>Pending Phase Approvals</h1>
                <PhasePaymentApprovalForm/>

                <h1>Pending Requisition Approvals</h1>
                <PendingRequisitionApprovalForm/>
            </div>
        </div>
    );
};

export default PendingRequestsPage;
