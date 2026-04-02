import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CatalogueInputSchema } from "../hooks/useGetCatalogues"; 

interface DeleteCatalogueButtonProps {
    orgId: string;
    catalogueId: string;
    quoteId: string;
}

const DeleteCatalogueButton = (props: DeleteCatalogueButtonProps) => {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post(
                "/catalogue/deleteCatalogue",
                {
                    catalogueId: props.catalogueId,
                    quoteId: props.quoteId,
                },
                {
                    headers: {
                        "x-organization-id": props.orgId,
                    },
                }
            );
            if (!response.data.success) {
                throw new Error(response.data.message);
            }
            return response.data;
        },
        onMutate: async () => {
            // 1. Target all queries that start with this base key
            const queryFilter = { queryKey: ["catalogue", props.orgId] };

            // 2. Cancel any outgoing refetches to prevent overwriting
            await queryClient.cancelQueries(queryFilter);

            // 3. Snapshot the previous data for ALL matching queries (pages/searches)
            const previousQueries = queryClient.getQueriesData<CatalogueInputSchema>(queryFilter);

            // 4. Optimistically update the cache for all matching queries
            queryClient.setQueriesData<CatalogueInputSchema>(
                queryFilter,
                (oldData) => {
                    if (!oldData) return oldData;

                    // SCENARIO A: If you are deleting a specific QUOTE from the catalogue item
                    return {
                        ...oldData,
                        data: oldData.data.map((item) => {
                            if (item.id === props.catalogueId) {
                                return {
                                    ...item,
                                    supplierQuotes: item.supplierQuotes?.filter(
                                        (quote) => quote.id !== props.quoteId
                                    ) || []
                                };
                            }
                            return item;
                        }),
                    };

                    /* SCENARIO B: If the endpoint deletes the ENTIRE CATALOGUE ITEM, use this instead:
                    return {
                        ...oldData,
                        count: Math.max(0, oldData.count - 1),
                        data: oldData.data.filter((item) => item.id !== props.catalogueId),
                    };
                    */
                }
            );

            // 5. Return the snapshot so we can roll back if it fails
            return { previousQueries };
        },
        onError: (error, variables, context) => {
            console.error("Failed to delete:", error);
            // 6. Roll back every specific query (page/search) to its exact previous state
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, previousData]) => {
                    if (previousData) {
                        queryClient.setQueryData(queryKey, previousData);
                    }
                });
            }
        },
        onSettled: () => {
            // 7. Force a background refetch to ensure the UI completely matches the server state
            queryClient.invalidateQueries({ queryKey: ["catalogue", props.orgId] });
        },
    });

    return (
        <Button
            onClick={(e) => {
                e.stopPropagation();
                deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
            className="justify-start border-0 bg-transparent px-2 font-sans text-sm font-medium text-red-600 shadow-none hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
        >
            <Trash className="size-4" />
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
        </Button>
    );
};

export default DeleteCatalogueButton;