import z from "zod";



export const formSchema = z.object({
    name: z.string().min(1, "Item Name is required"),
    supplier: z.string().min(1, "Supplier is required"),
    category: z.enum(["MATERIALS", "LABOUR", "EQUIPMENT", "SUBCONTRACTORS", "TRANSPORT", "OVERHEAD"]),
    unit: z.string().min(1, "Unit is required"),
    truePrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
    standardRate: z.coerce.number().min(0.01, "Rate must be greater than 0"),
    leadTime: z.coerce.number().min(0, "Lead time cannot be negative"),
});

export const editFormSchema = z.object({
    name: z.string().min(1, "Item Name is required"),
    supplier: z.string().min(1, "Supplier is required"),
    category: z.enum(["MATERIALS", "LABOUR", "EQUIPMENT", "SUBCONTRACTORS", "TRANSPORT", "OVERHEAD"]),
    unit: z.string().min(1, "Unit is required"),
    truePrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
    standardRate: z.coerce.number().min(0.01, "Rate must be greater than 0"),
    leadTime: z.coerce.number().min(0, "Lead time cannot be negative"),
    catalogueId: z.string().min(1, "Catalogue Id is required"),
    quoteId: z.string().min(1, "Quote Id is required")
});

export const deleteFormSchema = z.object({
    catalogueId: z.string().min(1, "Catalogue Id is required"),
    quoteId: z.string().min(1, "Quote Id is required")
})


export type createCatalogueFormSchema = z.infer<typeof formSchema>;
export type editCatalogueFormSchema = z.infer<typeof editFormSchema>;
export type deleteCatalogueFormSchema = z.infer<typeof deleteFormSchema>;