import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PendingPhaseListSchema } from "./usePendingPhaseList";

interface MutationProps {
    phaseId: string;
}

const approvePendingPayment = async (
    organizationId: string,
    phaseId: string,
) => {
    await api.put(
        "/project/phase/payment_approval",
        {
            id: phaseId,
        },
        {
            headers: {
                "x-organization-id": organizationId,
            },
        },
    );
};

export const useApprovePendingPayment = (
    organizationId: string | undefined,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ phaseId }: MutationProps) =>
            approvePendingPayment(organizationId!, phaseId),
        onMutate: async ({ phaseId }) => {
            await queryClient.cancelQueries({ queryKey: ["pendingPayments"] });

            const previousData =
                queryClient.getQueryData<PendingPhaseListSchema>([
                    "pendingPayments",
                ]);

            if (previousData) {
                queryClient.setQueryData<PendingPhaseListSchema>(
                    ["pendingPayments", organizationId],
                    {
                        ...previousData,
                        data: previousData.data.filter(
                            (item) => item.id !== phaseId,
                        ),
                        count: previousData.count - 1,
                    },
                );
            }
            return {
                previousData
            }
        },
        onError: (_error, _variables, context) => {
            if(context?.previousData !== undefined) {
                queryClient.setQueryData(
                    ["pendingPayments", organizationId],
                    context.previousData
                )
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["pendingPayments", organizationId],
            });
        },
    });
};
