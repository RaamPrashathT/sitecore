import api from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

interface CreateRequisitionPayload {
    title: string;
    items: Array<{
        catalogueId: string;
        quantity: number;
        estimatedUnitCost: number;
        assignedSupplierId?: string;
    }>;
}

export const useCreateRequisition = () => {
    return useMutation({
        mutationFn: async ({ phaseId, payload }: { phaseId: string, payload: CreateRequisitionPayload }) => {
            if (!phaseId) throw new Error("Missing Phase ID");
            
            // Matches backend: projectRouter.post("/phase/:phaseId/requisition")
            const { data } = await api.post(
                `/project/phase/${phaseId}/requisition`,
                payload
            );
            return data;
        },
    });
};