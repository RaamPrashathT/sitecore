import PhasePaymentApprovalForm from "@/components/pending/phase/PhasePaymentApprovalForm";

const PendingRequestsPage = () => {
    return (
        <div>
            <div>
                <h1>Pending Phase Approvals</h1>
                <PhasePaymentApprovalForm/>
            </div>
            <div>Pending Requisition Approvals</div>
        </div>
    );
};

export default PendingRequestsPage;
