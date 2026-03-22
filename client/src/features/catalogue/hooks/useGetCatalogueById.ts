import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { CatalogueItemType } from "./useGetCatalogues";

const getCatalogueById = async (
    organizationId: string,
    catalogueId: string,
    quoteId: string
) => {
    const response = await api.get<CatalogueItemType>(
        `/catalogue/${catalogueId}/${quoteId}`,
        {
            headers: {
                "x-organization-id": organizationId,
            },
        }
    );
    return response.data;
};

export const useGetCatalogueById = (
    organizationId: string | undefined,
    catalogueId: string | undefined,
    quoteId: string | undefined
) => {
    return useQuery({
        queryKey: ["catalogueItem", organizationId, catalogueId, quoteId],
        queryFn: () => getCatalogueById(organizationId!, catalogueId!, quoteId!),
        enabled: !!organizationId && !!catalogueId && !!quoteId,
    });
};