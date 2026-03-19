import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PhaseListType } from "./usePhaseList";

interface UseCreatePhaseSchema {
    organizationId: string | undefined;
    projectId: string | undefined;
}

type CreatePhaseSchema = {
    name: string;
    description: string;
    budget: string;
    paymentDeadline: Date;
    startDate: Date;
}

export const useCreatePhase = ({
    organizationId,
    projectId,
}: UseCreatePhaseSchema) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreatePhaseSchema) => {
            if (!organizationId || !projectId) {
                throw new Error("Missing organizationId or projectId");
            }
            const result = await api.post("/project/phase", data, {
                headers: {
                    "x-organization-id": organizationId,
                    "x-project-id": projectId,
                },
            });
            return result.data;
        },
        onMutate: async (newPhase: CreatePhaseSchema) => {
            await queryClient.cancelQueries({
                queryKey: ["phaseList", projectId, organizationId],
            });
            if (!organizationId || !projectId) {
                throw new Error("Missing organizationId or projectId");
            }
            const previousPhases = queryClient.getQueryData<PhaseListType[]>([
                "phaseList",
                projectId,
                organizationId,
            ]);

            const tempPhase: PhaseListType = {
                id: "temp-" + crypto.randomUUID(),

                name: newPhase.name,
                description: newPhase.description ?? null,

                budget: Number.parseInt(newPhase.budget),

                isPaid: false,
                status: "PAYMENT_PENDING",

                paymentDeadline: newPhase.paymentDeadline,
                projectId,

                requisitions: [],
            };

            queryClient.setQueryData(
                ["phaseList", projectId, organizationId],
                (old: PhaseListType[] = []) => [tempPhase, ...old],
            );

            return { previousPhases };
        },
        onError: (error, newPhase, context) => {
            if (context?.previousPhases !== undefined) {
                queryClient.setQueryData(
                    ["phaseList", projectId, organizationId],
                    context.previousPhases,
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["phaseList", projectId, organizationId],
            });
        },
    });
};
