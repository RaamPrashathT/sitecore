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

export type createCatalogueFormSchema = z.infer<typeof formSchema>;
