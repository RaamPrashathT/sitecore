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
import { useState } from "react";
import { Spinner } from "../../../components/ui/spinner";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
    name: z.string().min(1, "Item Name is required"),
    supplier: z.string().min(1, "Supplier is required"),
    category: z.enum(["MATERIALS", "LABOUR", "EQUIPMENT", "SUBCONTRACTORS", "TRANSPORT", "OVERHEAD"]),
    unit: z.string().min(1, "Unit is required"),
    truePrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
    standardRate: z.coerce.number().min(0.01, "Rate must be greater than 0"),
    leadTime: z.coerce.number().min(0, "Lead time cannot be negative"),
    inventory: z.coerce.number().min(0, "Inventory cannot be negative"),
});

type createCatalogueFormSchema = z.infer<typeof formSchema>;

interface CreateCatalogueFormProps {
    orgId: string;
    slug: string
}

const CreateCatalogueForm = ({
    orgId,
    slug
}: CreateCatalogueFormProps) => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            supplier: "",
            unit: "",
        },
    });
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const onSubmit = async(data: createCatalogueFormSchema) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/catalogue', data, {
                
                headers:{
                    "x-organization-id": orgId
                }
            })
            if(!response.data.success) {
                setError(response.data.message)
            }
            navigate(`/${slug}/catalogue`)
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center px-4 py-2 font-sans mt-5">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-4xl p-6 md:p-8"
            >
                <h1 className="mb-8 border-b border-border/70 pb-4 font-display text-3xl font-normal tracking-wide text-foreground">
                    Create Catalogue Item:
                </h1>
                <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Item Name</FieldLabel>
                        <Input {...register("name")} id="name" className="font-sans text-sm" />
                        {errors.name && (
                            <FieldError>{errors.name.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Supplier</FieldLabel>
                        <Input {...register("supplier")} id="supplier" className="font-sans text-sm" />
                        {errors.supplier && (
                            <FieldError>{errors.supplier.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Category</FieldLabel>
                        <Controller
                            name="category"
                            control={control}
                            rules={{ required: "Category is required" }}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger className="font-sans text-sm">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="MATERIALS">
                                                Materials
                                            </SelectItem>
                                            <SelectItem value="LABOUR">
                                                Labour  
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
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Unit</FieldLabel>
                        <Input
                            {...register("unit")}
                            placeholder="KG/Hour/Litre"
                            className="font-sans text-sm"
                        />
                        {errors.unit && (
                            <FieldError>{errors.unit.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">True Price</FieldLabel>
                        <Input {...register("truePrice")} placeholder="0" className="font-mono text-sm tabular-nums"/>
                        {errors.truePrice && (
                            <FieldError>{errors.truePrice.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Standard Rate</FieldLabel>
                        <Input {...register("standardRate")} placeholder="0" className="font-mono text-sm tabular-nums"/>
                        {errors.standardRate && (
                            <FieldError>
                                {errors.standardRate.message}
                            </FieldError>
                        )}
                    </Field>
                    <Field >
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Lead Time</FieldLabel>
                        <Input {...register("leadTime")} placeholder="0" className="font-mono text-sm tabular-nums"/>
                        {errors.leadTime && (
                            <FieldError className="">
                                {errors.leadTime.message}
                            </FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">Inventory</FieldLabel>
                        <Input {...register("inventory")} placeholder="0" className="font-mono text-sm tabular-nums"/>
                        {errors.inventory && (
                            <FieldError className="">
                                {errors.inventory.message}
                            </FieldError>
                        )}
                    </Field>
                </FieldGroup>
                    
                {error && <p className="text-red-500 py-2">{error}</p>}
                <div className="mt-8 flex justify-end">
                    <Button type="submit" className="h-10 w-60 bg-green-700 font-sans text-sm text-white hover:bg-green-800">
                        {isLoading && <Spinner />}
                        <p>Create Item</p>
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateCatalogueForm;
