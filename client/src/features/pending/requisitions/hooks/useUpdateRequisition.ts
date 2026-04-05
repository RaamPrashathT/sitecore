import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type PendingRequisitionSchema } from "./usePendingRequisition";

interface MutationProps {
    requisitionId: string;
    action: "APPROVE" | "REJECT";
}

const approveRequisition = async (
    organizationId: string,
    requisitionId: string,
) => {
    console.log(organizationId, requisitionId);
    await api.post(`project/requisition/${requisitionId}/approve`);
};

const rejectRequisition = async (requisitionId: string) => {
    await api.post(`project/requisition/${requisitionId}/reject`);
};

export const useUpdateRequisitions = (organizationId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ requisitionId, action }: MutationProps) => {
            if (action === "APPROVE") {
                return approveRequisition(organizationId!, requisitionId);
            } else {
                return rejectRequisition(organizationId!);
            }
        },

        onMutate: async ({ requisitionId }) => {
            await queryClient.cancelQueries({
                queryKey: ["pendingRequisitions"],
            });

            const previousData =
                queryClient.getQueryData<PendingRequisitionSchema>([
                    "pendingRequisitions",
                    organizationId,
                ]);

            if (previousData) {
                queryClient.setQueryData<PendingRequisitionSchema>(
                    ["pendingRequisitions", organizationId],
                    {
                        ...previousData,
                        data: previousData.data.filter(
                            (item) => item.id !== requisitionId,
                        ),
                        count: previousData.count - 1,
                    },
                );
            }
            return { previousData };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(
                    ["pendingRequisitions", organizationId],
                    context.previousData,
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["pendingRequisitions", organizationId],
            });
        },
    });
};
