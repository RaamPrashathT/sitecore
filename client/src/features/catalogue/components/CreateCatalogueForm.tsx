import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "../../../components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import { Spinner } from "../../../components/ui/spinner";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CatalogueInputSchema, CatalogueItemType } from "../hooks/useGetCatalogues"; 

// FIXED: Removed z.coerce and replaced with standard z.number()
const formSchema = z.object({
    name: z.string().min(1, "Item Name is required"),
    supplier: z.string().min(1, "Supplier is required"),
    email: z.string().email("Invalid email address"),
    category: z.enum(["MATERIALS", "LABOUR", "EQUIPMENT", "SUBCONTRACTORS", "TRANSPORT", "OVERHEAD"]),
    unit: z.string().min(1, "Unit is required"),
    truePrice: z.number().min(0.01, "Price must be > 0"),
    standardRate: z.number().min(0.01, "Rate must be > 0"),
    leadTime: z.number().min(0, "Cannot be negative"),
    inventory: z.number().min(0, "Cannot be negative"),
});

type createCatalogueFormSchema = z.infer<typeof formSchema>;

interface CreateCatalogueFormProps {
    orgId: string;
    slug: string;
}

const CreateCatalogueForm = ({ orgId, slug }: CreateCatalogueFormProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<createCatalogueFormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            supplier: "",
            email: "",
            unit: "",
            // Provide sensible defaults to prevent NaN errors
            truePrice: 0,
            standardRate: 0,
            leadTime: 0,
            inventory: 0,
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: createCatalogueFormSchema) => {
            const response = await api.post("/catalogue", data, {
                headers: {
                    "x-organization-id": orgId,
                },
            });
            if (!response.data.success) {
                throw new Error(response.data.message);
            }
            return response.data;
        },
        onMutate: async (newCatalogueData) => {
            const queryFilter = { queryKey: ["catalogue", orgId] };

            await queryClient.cancelQueries(queryFilter);

            const previousQueries = queryClient.getQueriesData<CatalogueInputSchema>(queryFilter);

            const tempId = `temp-${Date.now()}`;
            const optimisticItem: CatalogueItemType = {
                id: tempId,
                name: newCatalogueData.name,
                category: newCatalogueData.category,
                unit: newCatalogueData.unit,
                defaultLeadTime: newCatalogueData.leadTime,
                organizationId: orgId,
                inventory: newCatalogueData.inventory,
                supplierQuotes: [
                    {
                        id: `temp-quote-${Date.now()}`,
                        supplier: newCatalogueData.supplier,
                        email: newCatalogueData.email,
                        truePrice: newCatalogueData.truePrice,
                        standardRate: newCatalogueData.standardRate,
                        leadTime: newCatalogueData.leadTime,
                        catalogueId: tempId,
                    },
                ],
            };

            queryClient.setQueriesData<CatalogueInputSchema>(
                queryFilter,
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        count: oldData.count + 1,
                        data: [optimisticItem, ...oldData.data],
                    };
                }
            );

            navigate(`/${slug}/catalogue`);

            return { previousQueries };
        },
        onError: (error, _variables, context) => {
            console.error("Failed to create catalogue item:", error);
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, previousData]) => {
                    if (previousData) {
                        queryClient.setQueryData(queryKey, previousData);
                    }
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["catalogue", orgId] });
        },
    });

    const onSubmit = (data: createCatalogueFormSchema) => {
        createMutation.mutate(data);
    };

    return (
        <div className="flex items-center justify-center px-4 py-2 font-sans mt-5">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-4xl p-6 md:p-8"
            >
                <h1 className="mb-8 pb-4 font-display text-3xl font-normal tracking-wide text-foreground">
                    Create Catalogue Item:
                </h1>
                
                <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Item Name</FieldLabel>
                        <Input {...register("name")} id="name" className="font-sans text-sm" />
                        {errors.name && <FieldError>{errors.name.message}</FieldError>}
                    </Field>
                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Supplier</FieldLabel>
                        <Input {...register("supplier")} id="supplier" className="font-sans text-sm" />
                        {errors.supplier && <FieldError>{errors.supplier.message}</FieldError>}
                    </Field>
                    
                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Supplier Email</FieldLabel>
                        <Input {...register("email")} id="email" type="email" placeholder="contact@supplier.com" className="font-sans text-sm" />
                        {errors.email && <FieldError>{errors.email.message}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Category</FieldLabel>
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="font-sans text-sm">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="MATERIALS">Materials</SelectItem>
                                            <SelectItem value="LABOUR">Labour</SelectItem>
                                            <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                            <SelectItem value="SUBCONTRACTORS">Subcontractors</SelectItem>
                                            <SelectItem value="TRANSPORT">Transport</SelectItem>
                                            <SelectItem value="OVERHEAD">Overhead</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.category && <FieldError>{errors.category.message}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Unit</FieldLabel>
                        <Input {...register("unit")} placeholder="KG/Hour/Litre" className="font-sans text-sm" />
                        {errors.unit && <FieldError>{errors.unit.message}</FieldError>}
                    </Field>

                    {/* FIXED: Added type="number" and { valueAsNumber: true } to all numeric fields */}
                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">True Price</FieldLabel>
                        <Input type="number" step="any" {...register("truePrice", { valueAsNumber: true })} placeholder="0" className="font-mono text-sm tabular-nums"/>
                        {errors.truePrice && <FieldError>{errors.truePrice.message}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Standard Rate</FieldLabel>
                        <Input type="number" step="any" {...register("standardRate", { valueAsNumber: true })} placeholder="0" className="font-mono text-sm tabular-nums"/>
                        {errors.standardRate && <FieldError>{errors.standardRate.message}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Lead Time (Days)</FieldLabel>
                        <Input type="number" step="1" {...register("leadTime", { valueAsNumber: true })} placeholder="0" className="font-mono text-sm tabular-nums"/>
                        {errors.leadTime && <FieldError>{errors.leadTime.message}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Inventory</FieldLabel>
                        <Input type="number" step="1" {...register("inventory", { valueAsNumber: true })} placeholder="0" className="font-mono text-sm tabular-nums"/>
                        {errors.inventory && <FieldError>{errors.inventory.message}</FieldError>}
                    </Field>
                </FieldGroup>
                    
                {createMutation.error && (
                    <p className="text-red-500 py-2">{createMutation.error.message}</p>
                )}

                <div className="mt-8 flex justify-end">
                    <Button 
                        type="submit" 
                        disabled={createMutation.isPending}
                        className="h-10 w-60 bg-green-700 font-sans text-sm text-white hover:bg-green-800 disabled:opacity-50"
                    >
                        {createMutation.isPending && <Spinner />}
                        <p>{createMutation.isPending ? "Creating..." : "Create Item"}</p>
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateCatalogueForm;