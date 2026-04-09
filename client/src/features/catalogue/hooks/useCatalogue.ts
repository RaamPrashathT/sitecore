import api from "@/lib/axios";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

// Type definitions based on API response
export interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}

export interface SupplierQuote {
  id: string;
  truePrice: string;
  standardRate: string;
  leadTimeDays: number;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  supplierId: string;
  catalogueId: string;
  supplier: {
    id: string;
    name: string;
  };
}

export interface Location {
  id: string;
  name: string;
  type: string;
  organizationId: string;
}

export interface InventoryItem {
  id: string;
  quantityOnHand: string;
  averageUnitCost: string;
  locationId: string;
  catalogueId: string;
  location: Location;
}

export interface Creator {
  username: string;
  profileImage: string;
}

export interface CatalogueItem {
  id: string;
  name: string;
  category: "MATERIALS" | "LABOUR" | "EQUIPMENT" | "SUBCONTRACTORS" | "TRANSPORT" | "OVERHEAD";
  unit: string;
  defaultLeadTime: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  organizationId: string;
  supplierQuotes: SupplierQuote[];
  inventoryItems: InventoryItem[];
  creator: Creator;
}

export interface CatalogueListResponse {
  success: boolean;
  data: CatalogueItem[];
  meta: {
    total: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CatalogueDetailResponse {
  success: boolean;
  data: CatalogueItem;
}

// Hook to fetch paginated catalogue list
export const useGetCatalogues = (pageIndex: number = 0, pageSize: number = 10) => {
  return useQuery({
    queryKey: ["catalogues", pageIndex, pageSize],
    queryFn: async () => {
      const response = await api.get<CatalogueListResponse>(
        `/catalogue?index=${pageIndex}&size=${pageSize}`
      );
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

// Hook to fetch individual catalogue item by ID
export const useGetCatalogueById = (id: string | null) => {
  return useQuery({
    queryKey: ["catalogue", id],
    queryFn: async () => {
      const response = await api.get<CatalogueDetailResponse>(`/catalogue/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
