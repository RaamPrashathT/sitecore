import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface SupplierOption {
  id: string;
  name: string;
}

export interface LocationOption {
  id: string;
  name: string;
  type: string;
}

interface FormOptionsResponse {
  success: boolean;
  data: {
    suppliers: SupplierOption[];
    locations: LocationOption[];
  };
}

export const useGetFormOptions = () => {
  return useQuery({
    queryKey: ["catalogue-form-options"],
    queryFn: async () => {
      const response = await api.get<FormOptionsResponse>("/catalogue/form-options");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
