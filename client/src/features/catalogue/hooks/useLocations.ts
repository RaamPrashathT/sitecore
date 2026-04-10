import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface LocationOption {
  id: string;
  name: string;
  type: string;
}

interface LocationsResponse {
  success: boolean;
  data: LocationOption[];
}

export const useGetLocations = () => {
  return useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await api.get<LocationsResponse>("/locations");
      return response.data;
    },
  });
};
