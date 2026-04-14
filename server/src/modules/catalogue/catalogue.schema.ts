import z from "zod";

// ─── Catalogue Schemas ────────────────────────────────────────────────────────

export const getCatalogueSchema = z.object({
    organizationId: z.string().length(36),
    pageIndex: z.number().min(0),
    pageSize: z.number().min(1),
    searchQuery: z.string().max(500),
});

export const getCatalogueByIdSchema = z.object({
    catalogueId: z.string().length(36),
});

export const formSchema = z.object({
    name: z.string().min(1, "Item Name is required"),
    category: z.enum(["MATERIALS", "LABOUR", "EQUIPMENT", "SUBCONTRACTORS", "TRANSPORT", "OVERHEAD"]),
    unit: z.string().min(1, "Unit is required"),
});

export const editFormSchema = z.object({
    name: z.string().min(1, "Item Name is required"),
    category: z.enum(["MATERIALS", "LABOUR", "EQUIPMENT", "SUBCONTRACTORS", "TRANSPORT", "OVERHEAD"]),
    unit: z.string().min(1, "Unit is required"),
    catalogueId: z.string().min(1, "Catalogue Id is required"),
});

export const deleteFormSchema = z.object({
    catalogueId: z.string().min(1, "Catalogue Id is required"),
});

export type createCatalogueFormSchema = z.infer<typeof formSchema>;
export type editCatalogueFormSchema = z.infer<typeof editFormSchema>;
export type deleteCatalogueFormSchema = z.infer<typeof deleteFormSchema>;

// ─── Supplier Schemas ─────────────────────────────────────────────────────────

export const createSupplierSchema = z.object({
    name: z.string().min(1, "Supplier name is required"),
    contactName: z.string().optional(),
    email: z.string().min(1).optional(),
    phone: z.string().optional(),
});

export const editSupplierSchema = z.object({
    supplierId: z.string().uuid("Invalid supplier ID"),
    name: z.string().min(1, "Supplier name is required").optional(),
    contactName: z.string().optional(),
    email: z.string().min(1).optional(),
    phone: z.string().optional(),
});

export const deleteSupplierSchema = z.object({
    supplierId: z.string().uuid("Invalid supplier ID"),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type EditSupplierInput = z.infer<typeof editSupplierSchema>;
export type DeleteSupplierInput = z.infer<typeof deleteSupplierSchema>;

// ─── Supplier Quote Schemas ───────────────────────────────────────────────────

export const createSupplierQuoteSchema = z.object({
    catalogueId: z.string().uuid("Invalid catalogue ID"),
    supplierId: z.string().uuid("Invalid supplier ID"),
    truePrice: z.coerce.number().positive("True price must be positive"),
    standardRate: z.coerce.number().positive("Standard rate must be positive"),
    leadTimeDays: z.coerce.number().int().min(0).optional(),
    validUntil: z.string().datetime().optional(),
});

export const editSupplierQuoteSchema = z.object({
    quoteId: z.string().uuid("Invalid quote ID"),
    truePrice: z.coerce.number().positive("True price must be positive").optional(),
    standardRate: z.coerce.number().positive("Standard rate must be positive").optional(),
    leadTimeDays: z.coerce.number().int().min(0).optional(),
    validUntil: z.string().datetime().optional(),
});

export const deleteSupplierQuoteSchema = z.object({
    quoteId: z.string().uuid("Invalid quote ID"),
});

export type CreateSupplierQuoteInput = z.infer<typeof createSupplierQuoteSchema>;
export type EditSupplierQuoteInput = z.infer<typeof editSupplierQuoteSchema>;
export type DeleteSupplierQuoteInput = z.infer<typeof deleteSupplierQuoteSchema>;

// ─── Inventory Location Schemas ───────────────────────────────────────────────

export const createInventoryLocationSchema = z.object({
    name: z.string().min(1, "Location name is required"),
    type: z.string().min(1, "Location type is required"),
});

export const editInventoryLocationSchema = z.object({
    locationId: z.string().uuid("Invalid location ID"),
    name: z.string().min(1, "Location name is required").optional(),
    type: z.string().min(1, "Location type is required").optional(),
});

export const deleteInventoryLocationSchema = z.object({
    locationId: z.string().uuid("Invalid location ID"),
});

export type CreateInventoryLocationInput = z.infer<typeof createInventoryLocationSchema>;
export type EditInventoryLocationInput = z.infer<typeof editInventoryLocationSchema>;
export type DeleteInventoryLocationInput = z.infer<typeof deleteInventoryLocationSchema>;

// ─── Inventory Ledger Schemas ─────────────────────────────────────────────────

export const receiveMaterialSchema = z.object({
    catalogueId: z.string().uuid("Invalid catalogue ID"),
    locationId: z.string().uuid("Invalid location ID"),
    quantity: z.coerce.number().positive("Quantity must be positive"),
    unitCost: z.coerce.number().positive("Unit cost must be positive").optional(),
    notes: z.string().optional(),
});

export const consumeMaterialSchema = z.object({
    catalogueId: z.string().uuid("Invalid catalogue ID"),
    locationId: z.string().uuid("Invalid location ID"),
    quantity: z.coerce.number().positive("Quantity must be positive"),
    phaseId: z.string().uuid("Invalid phase ID"),
    notes: z.string().optional(),
});

export const adjustMaterialSchema = z.object({
    catalogueId: z.string().uuid("Invalid catalogue ID"),
    locationId: z.string().uuid("Invalid location ID"),
    quantity: z.coerce.number({ error: "Quantity must be a number" }),
    notes: z.string().min(1, "Notes are required for adjustments"),
});

export const getInventoryTransactionsSchema = z.object({
    catalogueId: z.string().uuid().optional(),
    locationId: z.string().uuid().optional(),
    pageIndex: z.coerce.number().min(0).default(0),
    pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type ReceiveMaterialInput = z.infer<typeof receiveMaterialSchema>;
export type ConsumeMaterialInput = z.infer<typeof consumeMaterialSchema>;
export type AdjustMaterialInput = z.infer<typeof adjustMaterialSchema>;
export type GetInventoryTransactionsInput = z.infer<typeof getInventoryTransactionsSchema>;
