import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface SupplierOption {
  id: string;
  name: string;
}

interface SuppliersResponse {
  success: boolean;
  data: SupplierOption[];
}

export const useGetSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const response = await api.get<SuppliersResponse>("/suppliers");
      return response.data;
    },
  });
};
