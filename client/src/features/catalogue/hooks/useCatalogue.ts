import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type {
  CreateCatalogueInput,
  UpdateCatalogueInput,
  CreateQuoteInput,
  UpdateQuoteInput,
  UpdateInventoryInput,
} from "../catalogueSchema";

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

// QUERIES

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

// MUTATIONS

// Create Catalogue
export const useCreateCatalogue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCatalogueInput) => {
      const response = await api.post("/catalogue", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogues"] });
    },
  });
};

// Update Catalogue (Master info only)
export const useUpdateCatalogue = (catalogueId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCatalogueInput) => {
      const response = await api.put(`/catalogue/${catalogueId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogues"] });
      queryClient.invalidateQueries({ queryKey: ["catalogue", catalogueId] });
    },
  });
};

// Delete Catalogue
export const useDeleteCatalogue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (catalogueId: string) => {
      const response = await api.delete(`/catalogue/${catalogueId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogues"] });
    },
  });
};

// Create Quote
export const useCreateQuote = (catalogueId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuoteInput) => {
      const response = await api.post(`/catalogue/${catalogueId}/quote`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogues"] });
      queryClient.invalidateQueries({ queryKey: ["catalogue", catalogueId] });
    },
  });
};

// Update Quote
export const useUpdateQuote = (catalogueId: string, quoteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateQuoteInput) => {
      const response = await api.put(`/catalogue/${catalogueId}/quote/${quoteId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogues"] });
      queryClient.invalidateQueries({ queryKey: ["catalogue", catalogueId] });
    },
  });
};

// Delete Quote
export const useDeleteQuote = (catalogueId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      const response = await api.delete(`/catalogue/${catalogueId}/quote/${quoteId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogues"] });
      queryClient.invalidateQueries({ queryKey: ["catalogue", catalogueId] });
    },
  });
};

// Update Inventory
export const useUpdateInventory = (catalogueId: string, inventoryId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateInventoryInput) => {
      const response = await api.put(`/catalogue/${catalogueId}/inventory/${inventoryId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogues"] });
      queryClient.invalidateQueries({ queryKey: ["catalogue", catalogueId] });
    },
  });
};
