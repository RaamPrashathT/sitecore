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
    supplierQuotes: {
        id: string;
        supplier: string;
        truePrice: number;
        standardRate: number;
        leadTime: number | null;
    }[];
};

export const useGetCatalogue = (orgId: string) => {
    return useQuery({
        queryKey: ['catalogue', orgId],
        queryFn: async () => {
            const response = await api.get("/catalogue/getCatalogue", {
                headers:{
                    "x-org-id": orgId
                }
            })
            if(!response.data.success) {
                throw new Error(response.data.message)
            }
            return response.data.data as Promise<CatalogueWithQuotes[]>
        },
        enabled: !!orgId,
    })
}