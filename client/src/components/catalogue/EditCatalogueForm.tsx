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
import { Input } from "../ui/input";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { useGetCatalogue } from "@/hooks/useGetCatalogs";

const formSchema = z.object({
    name: z.string().min(1, "Item Name is required"),
    supplier: z.string().min(1, "Supplier is required"),
    category: z.enum([
        "MATERIALS",
        "LABOUR",
        "EQUIPMENT",
        "SUBCONTRACTORS",
        "TRANSPORT",
        "OVERHEAD",
    ]),
    unit: z.string().min(1, "Unit is required"),
    truePrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
    standardRate: z.coerce.number().min(0.01, "Rate must be greater than 0"),
    leadTime: z.coerce.number().min(0, "Lead time cannot be negative"),
});

type createCatalogueFormSchema = z.infer<typeof formSchema>;

interface EditCatalogueFormProps {
    id: string;
    slug: string;
    catalogueId: string;
    quoteId: string;
}

const EditCatalogueForm = ({
    id,
    slug,
    catalogueId,
    quoteId,
}: EditCatalogueFormProps) => {
    const { data: catalogueItems, isLoading } = useGetCatalogue(id);
    const selectedCatalogueItem = catalogueItems?.find(
        (item) => item.id === catalogueId,
    );

    const selectedQuote = selectedCatalogueItem?.supplierQuotes.find(
        (quote) => quote.id === quoteId,
    );  
    
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
        values: {
            name: selectedCatalogueItem?.name || "",
            supplier: selectedQuote?.supplier || "",
            unit: selectedCatalogueItem?.unit || "",
            category: selectedCatalogueItem?.category || "MATERIALS",
            truePrice: selectedQuote?.truePrice || 0,
            standardRate: selectedQuote?.standardRate || 0,
            leadTime: selectedQuote?.leadTime ?? selectedCatalogueItem?.defaultLeadTime ?? 0,
        },
    });

    const navigate = useNavigate();
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const onSubmit = async (data: createCatalogueFormSchema) => {
        setIsLoadingState(true);
        setError(null);
        try {
            const response = await api.put(
                "/catalogue",
                {
                    ...data,
                    catalogueId: catalogueId,
                    quoteId: quoteId,
                },
                {
                    headers: {
                        "x-organization-id": id,
                    },
                },
            );
            if (!response.data.success) {
                setError(response.data.message);
            }
            navigate(`/${slug}/catalogue`);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        } finally {
            setIsLoadingState(false);
        }
    };
    if (isLoading) return <div>Loading...</div>;
    return (
        <div className="flex items-center justify-center ">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-3xl"
            >
                <h1 className="text-3xl font-semibold my-8">
                    Edit Catalogue Item:
                </h1>
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                    <Field>
                        <FieldLabel>Item Name</FieldLabel>
                        <Input {...register("name")} id="name" />
                        {errors.name && (
                            <FieldError>{errors.name.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel>Supplier</FieldLabel>
                        <Input {...register("supplier")} id="supplier" />
                        {errors.supplier && (
                            <FieldError>{errors.supplier.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel>Category</FieldLabel>
                        <Controller
                            name="category"
                            control={control}
                            rules={{ required: "Category is required" }}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="MATERIALS">
                                                Materials
                                            </SelectItem>
                                            <SelectItem value="SERVICES">
                                                Services
                                            </SelectItem>
                                            <SelectItem value="EQUIPMENT">
                                                Equipment
                                            </SelectItem>
                                            <SelectItem value="SUBCONTRACTORS">
                                                Subcontractors
                                            </SelectItem>
                                            <SelectItem value="TRANSPORT">
                                                Transport
                                            </SelectItem>

                                            <SelectItem value="OVERHEAD">
                                                Overhead
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                        />

                        {errors.category && (
                            <FieldError>{errors.category.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel>Unit:</FieldLabel>
                        <Input
                            {...register("unit")}
                            placeholder="KG/Hour/Litre"
                        />
                        {errors.unit && (
                            <FieldError>{errors.unit.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel>True Price</FieldLabel>
                        <Input {...register("truePrice")} />
                        {errors.truePrice && (
                            <FieldError>{errors.truePrice.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel>Standard Rate</FieldLabel>
                        <Input {...register("standardRate")} />
                        {errors.standardRate && (
                            <FieldError>
                                {errors.standardRate.message}
                            </FieldError>
                        )}
                    </Field>
                </FieldGroup>
                <Field className="mt-4">
                        <FieldLabel>Lead Time</FieldLabel>
                        <Input {...register("leadTime")} />
                        {errors.leadTime && (
                            <FieldError className="">
                                {errors.leadTime.message}
                            </FieldError>
                        )}
                    </Field>
                {error && <p className="text-red-500 py-2">{error}</p>}
                <div className="flex justify-end mt-8">
                    <Button type="submit" className="w-60">
                        {isLoadingState && <Spinner />}
                        <p>Edit Item</p>
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditCatalogueForm;
