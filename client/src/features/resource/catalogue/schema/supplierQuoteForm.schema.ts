import * as z from "zod";

const optionalText = z
    .string()
    .transform((value) => value.trim())
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional();

export const supplierQuoteFormSchema = z
    .object({
        supplierMode: z.enum(["existing", "new"]),
        supplierId: z.string().optional(),
        name: z.string().trim().optional(),
        email: z.string().trim().optional(),
        phone: z.string().trim().optional(),
        contactPerson: optionalText,
        address: optionalText,
        truePrice: z.coerce.number().positive("True price must be greater than 0"),
        standardRate: z.coerce
            .number()
            .positive("Standard rate must be greater than 0"),
        leadTime: z
            .union([z.literal(""), z.coerce.number().int().min(0)])
            .optional()
            .transform((value) => (value === "" || value === undefined ? undefined : value)),
    })
    .refine(
        (data) => data.supplierMode === "new" || Boolean(data.supplierId),
        {
            path: ["supplierId"],
            message: "Select a supplier",
        },
    )
    .refine(
        (data) => data.supplierMode === "existing" || Boolean(data.name?.trim()),
        {
            path: ["name"],
            message: "Supplier name is required",
        },
    )
    .refine(
        (data) =>
            data.supplierMode === "existing" ||
            Boolean(data.email?.trim()) &&
                z.string().email().safeParse(data.email?.trim()).success,
        {
            path: ["email"],
            message: "Enter a valid email",
        },
    )
    .refine(
        (data) => data.supplierMode === "existing" || Boolean(data.phone?.trim()),
        {
            path: ["phone"],
            message: "Phone is required",
        },
    );

export type SupplierQuoteFormInput = z.input<typeof supplierQuoteFormSchema>;
export type SupplierQuoteFormValues = z.output<typeof supplierQuoteFormSchema>;
