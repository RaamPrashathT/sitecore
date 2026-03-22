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
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { useGetCatalogueById } from "../hooks/useGetCatalogueById";

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
    const { data: catalogueItem, isLoading } = useGetCatalogueById(
        id,
        catalogueId,
        quoteId
    );

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<createCatalogueFormSchema>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            supplier: "",
            unit: "",
            category: "MATERIALS",
            truePrice: 0,
            standardRate: 0,
            leadTime: 0,
        },
    });

    
    useEffect(() => {
        if (catalogueItem) {
            const selectedQuote = catalogueItem.supplierQuotes?.find(
                (quote) => quote.id === quoteId
            );

            reset({
                name: catalogueItem.name || "",
                supplier: selectedQuote?.supplier || "",
                unit: catalogueItem.unit || "",
                category: catalogueItem.category || "MATERIALS",
                truePrice: selectedQuote?.truePrice || 0,
                standardRate: selectedQuote?.standardRate || 0,
                leadTime: selectedQuote?.leadTime ?? catalogueItem.defaultLeadTime ?? 0,
            });
        }
    }, [catalogueItem, quoteId, reset]);

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
                }
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

    if (!catalogueItem && !isLoading) {
        return <div className="text-center py-10 text-xl font-semibold">Catalogue Item not found!</div>;
    }

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
                    <Button type="submit" className="w-60" disabled={isLoadingState}>
                        {isLoadingState && <Spinner />}
                        <p>Edit Item</p>
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditCatalogueForm;