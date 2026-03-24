import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type PendingInvitationResponse } from "./usePendingInvitations";

interface MutationProps {
    userId: string;
    role: "ENGINEER" | "CLIENT";
}

const assignEngineer = async (organizationId: string, userId: string) => {
    await api.post(
        `pending/assignEngineer`,
        {
            userId,
        },
        {
            headers: {
                "x-organization-id": organizationId,
            },
        },
    );
};

const assignClient = async (organizationId: string, userId: string) => {
    await api.post(
        `/pending/assignClient`,
        {
            userId,
        },
        {
            headers: {
                "x-organization-id": organizationId,
            },
        },
    );
};

export const useAssignRole = (organizationId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }: MutationProps) => {
            if (role === "ENGINEER") {
                return assignEngineer(organizationId!, userId);
            } else {
                return assignClient(organizationId!, userId);
            }
        },

        onMutate: async ({ userId }) => {
            const queryFilter = {
                queryKey: ["pendingInvitations", organizationId],
            };

            await queryClient.cancelQueries(queryFilter);

            const previousQueries =
                queryClient.getQueriesData<PendingInvitationResponse>(
                    queryFilter,
                );

            queryClient.setQueriesData<PendingInvitationResponse>(
                queryFilter,
                (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        data: oldData.data.filter(
                            (item) => item.userId !== userId,
                        ),
                        totalCount: oldData.totalCount - 1,
                    };
                },
            );

            return { previousQueries };
        },

        onError: (_error, _variables, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(
                    ([exactQueryKey, previousData]) => {
                        queryClient.setQueryData(exactQueryKey, previousData);
                    },
                );
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["pendingInvitations", organizationId],
            });
        },
    });
};
