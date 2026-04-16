import * as z from 'zod'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const CatalogueCategory = z.enum([
    'MATERIALS',
    'LABOUR',
    'EQUIPMENT',
    'SUBCONTRACTORS',
    'TRANSPORT',
    'OVERHEAD',
])
export type CatalogueCategory = z.infer<typeof CatalogueCategory>

// ─── Catalogue Item (list) ────────────────────────────────────────────────────

export const catalogueItemSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1),
    category: CatalogueCategory,
    unit: z.string().min(1),
    defaultLeadTime: z.number().int().min(0),
    quotesCount: z.number().int().min(0).default(0),
    suppliersCount: z.number().int().min(0).default(0),
    locationsCount: z.number().int().min(0).default(0),
})
export type CatalogueItem = z.infer<typeof catalogueItemSchema>

// ─── Catalogue Item Detail ────────────────────────────────────────────────────

export const catalogueItemDetailSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1),
    category: CatalogueCategory,
    unit: z.string().min(1),
    defaultLeadTime: z.number().int().min(0).nullable().optional(),
})
export type CatalogueItemDetail = z.infer<typeof catalogueItemDetailSchema>

// ─── List Response ────────────────────────────────────────────────────────────

export const catalogueListResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.array(catalogueItemSchema),
    count: z.number(),
    pageIndex: z.number(),
    pageSize: z.number(),
})
export type CatalogueListResponse = z.infer<typeof catalogueListResponseSchema>

// ─── Create / Update catalogue item ──────────────────────────────────────────

export const createCatalogueItemSchema = z.object({
    name: z.string({ error: 'Name is required' }).min(1, 'Name is required'),
    category: CatalogueCategory,
    unit: z.string({ error: 'Unit is required' }).min(1, 'Unit is required'),
    defaultLeadTime: z
        .number({ error: 'Lead time must be a number' })
        .int()
        .min(0, 'Lead time cannot be negative'),
})
export type CreateCatalogueItemInput = z.infer<typeof createCatalogueItemSchema>

export const updateCatalogueItemSchema = createCatalogueItemSchema.partial().extend({
    id: z.uuid(),
})
export type UpdateCatalogueItemInput = z.infer<typeof updateCatalogueItemSchema>

// ─── Supplier Quote ───────────────────────────────────────────────────────────

export const catalogueQuoteRowSchema = z.object({
    id: z.uuid(),
    truePrice: z.number(),
    standardRate: z.number(),
    leadTime: z.number().nullable().optional(),
    inventory: z.number(),
    supplier: z.object({
        id: z.uuid(),
        name: z.string(),
    }),
})
export type CatalogueQuoteRow = z.infer<typeof catalogueQuoteRowSchema>

export const updateQuoteSchema = z.object({
    truePrice: z.number({ error: 'True price is required' }).min(0),
    standardRate: z.number({ error: 'Standard rate is required' }).min(0),
    leadTime: z.number().int().min(0).nullable().optional(),
    inventory: z.number({ error: 'Inventory is required' }).min(0),
    changeReason: z.string().min(1, 'Change reason is required'),
})
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>

// ─── Supplier ─────────────────────────────────────────────────────────────────

export const catalogueSupplierRowSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    contactPerson: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
})
export type CatalogueSupplierRow = z.infer<typeof catalogueSupplierRowSchema>

export const updateSupplierSchema = z.object({
    name: z.string({ error: 'Name is required' }).min(1, 'Name is required'),
    email: z.string().email('Invalid email').nullable().optional(),
    phone: z.string().nullable().optional(),
    contactPerson: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
})
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>

// ─── Stock / Location ─────────────────────────────────────────────────────────

export const catalogueStockRowSchema = z.object({
    id: z.uuid(),
    catalogueId: z.uuid(),
    locationId: z.uuid(),
    quantity: z.number().optional(),
    availableQuantity: z.number().optional(),
    reservedQuantity: z.number().optional(),
    updatedAt: z.string().optional(),
    location: z.object({
        id: z.uuid(),
        name: z.string(),
    }).optional(),
})
export type CatalogueStockRow = z.infer<typeof catalogueStockRowSchema>
