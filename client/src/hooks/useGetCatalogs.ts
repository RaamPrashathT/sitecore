import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export type CatalogueWithQuotes = {
    id: string;
    name: string;
    category:
        | "MATERIALS"
        | "LABOUR"
        | "EQUIPMENT"
        | "SUBCONTRACTORS"
        | "TRANSPORT"
        | "OVERHEAD";
    unit: string;
    defaultLeadTime: number;
    organizationId: string;
    supplierQuotes: {
        id: string;
        supplier: string;
        truePrice: number;
        standardRate: number;
        leadTime: number | null;
        catalogueId: string;
    }[];
};


export const useGetCatalogue = (orgId: string) => {

    return useQuery({
        queryKey: ['catalogue', orgId],
        queryFn: async () => {
            const response = await api.get<CatalogueWithQuotes[]>("/catalogue/", {
                headers:{
                    "x-organization-id": orgId
                }
            })
            const safeData = response.data.map(item => ({
                ...item,
                supplierQuotes: item.supplierQuotes || [] 
            }));

            return safeData;
        },
        enabled: !!orgId,
    })
}