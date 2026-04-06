import { useParams, useNavigate } from "react-router-dom";
import { useMembership } from "@/hooks/useMembership";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, Loader2, Calendar } from "lucide-react";

// --- 1. LOCAL HOOK: FETCH PAYMENT ---
interface PaymentDetail {
    id: string;
    phaseName: string;
    projectName: string;
    budget: number;
    paymentDeadline: string;
    status: string;
    isPaid: boolean;
}

const useGetPaymentById = (phaseId: string | undefined) => {
    return useQuery({
        queryKey: ["paymentDetail", phaseId],
        queryFn: async () => {
            const { data } = await api.get<PaymentDetail>(
                `/dashboard/payment/id/${phaseId}`,
            );
            return data;
        },
        enabled: !!phaseId,
    });
};

// --- 2. MAIN PAGE COMPONENT ---
const IndividualPaymentAcceptancePage = () => {
    const { phaseId } = useParams<{ phaseId: string }>(); // Now explicitly using ID
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: membership } = useMembership();
    const { data: payment, isLoading, error } = useGetPaymentById(phaseId);

    // Inline Approval Mutation
    const { mutate: approvePayment, isPending: isApproving } = useMutation({
        mutationFn: async (id: string) => {
            await api.put("/dashboard/phase/payment_approval", { id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pendingPayments"] });
            navigate(`/${membership?.slug || ""}`);
        },
    });

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-48 w-full rounded-xl" />
            </div>
        );
    }

    if (error || !payment) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center mt-20">
                <h2 className="text-2xl font-bold text-foreground">
                    Payment Not Found
                </h2>
                <p className="text-muted-foreground mt-2">
                    The requested payment record could not be located.
                </p>
                <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    className="mt-6"
                >
                    Go Back
                </Button>
            </div>
        );
    }

    const deadline = new Date(payment.paymentDeadline);
    const now = new Date();
    const diffInMs = deadline.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    const isOverdue = diffInDays < 0;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 h-full font-sans ">
            {/* Top Navigation */}
            <div>
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-muted-foreground hover:text-foreground pl-0 -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>

            {/* Header Info Card */}
            <Card className="p-6 sm:p-8 shadow-none border-x-0 border-t-0 border-b rounded-none border-gray-200">
                <div className="flex flex-col md:flex-row justify-between gap-6 md:items-start">
                    <div className="flex gap-4">
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                                {payment.phaseName}
                            </h1>
                            <p className="text-sm font-medium text-muted-foreground">
                                Project:{" "}
                                <span className="text-foreground">
                                    {payment.projectName}
                                </span>
                            </p>

                            {/* Deadline Indicator */}
                            <div className="flex items-center gap-2 text-xs font-medium mt-2 inline-flex">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Due Date:{" "}
                                </span>
                                <span className="font-mono">
                                    {deadline.toLocaleDateString()}
                                </span>
                                <span
                                    className={`ml-2 px-2 py-0.5 rounded-sm ${isOverdue ? "bg-red-50 text-red-600" : "bg-muted text-muted-foreground"}`}
                                >
                                    {isOverdue
                                        ? `${Math.abs(diffInDays)} Days Overdue`
                                        : diffInDays === 0
                                          ? "Due Today"
                                          : `${diffInDays} Days Remaining`}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="md:text-right bg-muted/30 p-4 rounded-lg md:bg-transparent md:p-0">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                            Amount Due
                        </p>
                        <p className="text-3xl font-mono font-black text-foreground">
                            ₹{payment.budget.toLocaleString("en-IN")}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Action Footer */}
            <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 m">
                <Button
                    onClick={() => approvePayment(payment.id)}
                    disabled={isApproving}
                >
                    {isApproving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Check className="h-5 w-5" />
                    )}
                    <span>Confirm Payment Received</span>
                </Button>
            </div>
        </div>
    );
};

export default IndividualPaymentAcceptancePage;
